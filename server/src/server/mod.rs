mod logger;
mod dto;
mod multipart;
mod resources;
pub use self::resources::UI_APP_VERSION;

use std::collections::HashMap;
use std::sync::Arc;
use std::fs;

use iron::prelude::*;
use iron::status;
use router::Router;
use iron::mime::Mime;
use mime_guess::guess_mime_type;
use serde::Serialize;
use serde_json;
use url::percent_encoding::percent_decode;

use storage::Storage;
use storage::types::{Id, RecordType};
use utils::convert_all_into;
use error::{Result, Error, into_err};
use config::Config;

use self::logger::Logger;
use self::dto::*;
use self::multipart::{parse_multipart, RequestData};

fn get_request_body(req: &mut Request) -> Result<String> {
    use std::io::Read;

    let mut body = String::new();

    try!(req.body.read_to_string(&mut body).map_err(into_err));

    Ok(body)
}

fn parse_id (id_str: &str) -> Result<Id> {
    match id_str.parse() {
        Ok(id) => Ok(id),
        Err(_) => Err(Error::from_str("can't parse id")),
    }
}

fn create_response<T: Serialize> (data: &T) -> IronResult<Response> {
    let data = itry!(serde_json::to_string(data), status::InternalServerError);

    let content_type = "application/json".parse::<Mime>().unwrap();

    Ok(Response::with((content_type, status::Ok, data)))
}

fn create_static_response (file_name: &str, files: &HashMap<&str, &str>) -> IronResult<Response> {
    if let Some(&data) = files.get(file_name) {
        Ok(Response::with((guess_mime_type(file_name), status::Ok, data)))
    } else {
        Ok(Response::with((status::NotFound, "Not Found")))
    }
}

fn get_url_param (req: &Request, name: &str) -> Result<String> {
    let result = req.extensions.get::<Router>().expect("failed to load Iron Router").find(name);

    if let Some(value) = result {
        let string = value.to_string();

        let decoded = percent_decode(string.as_bytes()).decode_utf8().map_err(into_err)?;

        Ok(decoded.into_owned())
    } else {
        Err(Error::from_str(format!("can't find required url param :{}", name)))
    }
}

fn get_id (req: &Request) -> Result<Id> {
    parse_id(&get_url_param(req, "id")?)
}

pub fn start_server(config: &Config) {

    // print DB file size
    if let Ok(metadata) = fs::metadata(&config.db_file) {
        println!("db file size: {:.3} MB", metadata.len() as f64 / 1024.0 / 1024.0);
    }

    let storage = Storage::new(&config.db_file).expect("failed to open db");

    storage.init().expect("failed to init DB");

    let storage = Arc::new(storage);

    let mut router = Router::new();

    // GET /api/records
    {
        let storage = storage.clone();
        router.get("/api/records/notes", move |_: &mut Request| {

            let records = itry!(
                storage.list_records(RecordType::Note),
                status::InternalServerError
            );

            let dtos: Vec<RecordDTO> = convert_all_into(records);

            create_response(&dtos)
        }, "get records");
    }

    // POST /api/notes
    {
        let storage = storage.clone();
        router.post("/api/notes", move |req: &mut Request| {
            // parse request body
            let body = itry!(
                get_request_body(req), status::BadRequest
            );
            let dto: CreateNoteDTO = itry!(
                serde_json::from_str(&body), status::BadRequest
            );

            let id = itry!(
                storage.add_note(&dto.name, &dto.data),
                status::InternalServerError
            );

            let note_opt = itry!(storage.get_note(id));
            let note = itry!(
                note_opt.ok_or(Error::from_str("Can't find note")),
                status::NotFound
            );

            let dto: NoteDTO = note.into();

            create_response(&dto)
        }, "add note");
    }

    // PUT /api/notes/:id
    {
        let storage = storage.clone();
        router.put("/api/notes/:id", move |req: &mut Request| {
            let id = itry!(get_id(req), status::BadRequest);

            // parse request body
            let body = itry!(
                get_request_body(req), status::BadRequest
            );
            let dto: UpdateNoteDTO = itry!(
                serde_json::from_str(&body), status::BadRequest
            );

            // update note
            let updated = itry!(
                storage.update_note(id, &dto.name, &dto.data),
                status::InternalServerError
            );

            if !updated {
                return Err(IronError::new(Error::from_str("Can't find note"), status::NotFound));
            }

            // return updated note
            let note = itry!(
                storage.get_note(id)
                    .and_then(|note| note.ok_or(Error::from_str("Can't find note"))),
                status::InternalServerError
            );

            let dto: NoteDTO = note.into();

            create_response(&dto)
        }, "update note");
    }

    // GET /api/notes/:id
    {
        let storage = storage.clone();
        router.get("/api/notes/:id", move |req: &mut Request| {
            let id = itry!(get_id(req), status::BadRequest);

            let note_opt = itry!(storage.get_note(id));
            let note = itry!(
                note_opt.ok_or(Error::from_str("Can't find note")),
                status::NotFound
            );

            let dto: NoteDTO = note.into();

            create_response(&dto)
        }, "get note");
    }

    // DELETE /api/notes/:id
    {
        let storage = storage.clone();
        router.delete("/api/notes/:id", move |req: &mut Request| {
            let id = itry!(get_id(req), status::BadRequest);

            if itry!(storage.remove_note(id)) {
                Ok(Response::with(status::Ok))
            } else {
                Err(IronError::new(Error::from_str("Can't find note"), status::NotFound))
            }

        }, "delete note");
    }

    // GET /api/notes/:id/files
    {
        let storage = storage.clone();
        router.get("/api/notes/:id/files", move |req: &mut Request| {
            let id = itry!(get_id(req), status::BadRequest);

            let note_opt = itry!(storage.get_note(id));
            let note = itry!(
                note_opt.ok_or(Error::from_str("Can't find note")),
                status::NotFound
            );

            let dto: NoteDTO = note.into();

            create_response(&dto.files)
        }, "get note files");
    }

    // POST /api/notes/:id/files
    {
        let storage = storage.clone();
        router.post("/api/notes/:id/files", move |req: &mut Request| {
            // extract :id
            let id = itry!(get_id(req), status::BadRequest);

            // parse form data
            let data = itry!(parse_multipart(req), status::BadRequest);

            if data.len() != 2 { // unexpected number of form fields
                return Ok(Response::with(status::BadRequest));
            }

            let name_field = itry!(
                data.get("name").ok_or(Error::from_str("Can't find required field 'name'")),
                status::BadRequest
            );
            let data_field = itry!(
                data.get("data").ok_or(Error::from_str("Can't find required field 'data'")),
                status::BadRequest
            );

            match (name_field, data_field) {
                (&RequestData::Field(ref name), &RequestData::File(ref data)) => {

                    let info = itry!(storage.add_file(id, name, data));

                    let info_dto: FileInfoDTO = info.into();

                    create_response(&info_dto)
                },
                _ => Ok(Response::with(status::BadRequest)),
            }
        }, "add note file");
    }

    // GET /api/notes/:id/files/:name
    {
        let storage = storage.clone();
        router.get("/api/notes/:id/files/:name", move |req: &mut Request| {
            // extract :id
            let id = itry!(get_id(req), status::BadRequest);

            // extract file :name
            let name = itry!(get_url_param(req, "name"), status::BadRequest);

            // read and send file
            if let Some(blob) = itry!(storage.get_file(id, &name)) {
                Ok(Response::with((guess_mime_type(name), status::Ok, blob.0)))
            } else {
                Err(IronError::new(Error::from_str("Can't find file"), status::NotFound))
            }
        }, "get note file");
    }

    // DELETE /api/notes/:id/files/:name
    {
        let storage = storage.clone();
        router.delete("/api/notes/:id/files/:name", move |req: &mut Request| {
            // extract :id
            let id = itry!(get_id(req), status::BadRequest);

            // extract file :name
            let name = itry!(get_url_param(req, "name"), status::BadRequest);

            // delete file
            if itry!(storage.remove_file(id, &name)) {
                Ok(Response::with(status::Ok))
            } else {
                Err(IronError::new(Error::from_str("Can't find file"), status::NotFound))
            }

        }, "delete note file");
    }

    // Serve static files
    {
        let static_files = resources::get_static_files();
        router.get("/", move |_: &mut Request| {
            create_static_response("index.html", &static_files)
        }, "static_index_handler");
    }
    {
        let static_files = resources::get_static_files();
        router.get("/*", move |req: &mut Request| {
            let path = req.url.path();

            if path.len() == 1 {
                create_static_response(path[0], &static_files)
            } else {
                Ok(Response::with(status::NotFound))
            }
        }, "static_handler");
    }

    println!("running server on {}", &config.server_address);

    let mut chain = Chain::new(router);

    chain.link_before(Logger);
    chain.link_after(Logger);

    Iron::new(chain).http(&config.server_address as &str).expect("failed to run server");
}
