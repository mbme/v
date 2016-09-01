mod logger;
mod dto;

use iron::prelude::*;
use iron::status;
use router::Router;
use iron::mime::Mime;
use serde::Serialize;
use serde_json;

use storage::types::Id;
use server::dto::*;
use utils::convert_all_into;
use error::{Result, Error, into_err};

use self::logger::LoggerHandler;

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

fn get_id (req: &Request) -> Result<Id> {
    let id = req.extensions.get::<Router>().unwrap().find("id").unwrap();

    parse_id(id)
}


pub fn start_server(addr: &str) {
    use storage::Storage;
    use std::sync::Arc;

    let storage = Storage::in_mem();
    storage.init().expect("failed to init DB");

    let storage = Arc::new(storage);

    let mut router = Router::new();

    // GET /records
    {
        let storage = storage.clone();
        router.get("/records", move |_req: &mut Request| {

            let records = itry!(storage.list_records(), status::InternalServerError);

            let dtos: Vec<RecordDTO> = convert_all_into(records);

            create_response(&dtos)
        });
    }

    // POST /notes
    {
        let storage = storage.clone();
        router.post("/notes", move |req: &mut Request| {
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

            let note_opt = itry!(
                storage.get_note(id),
                status::InternalServerError
            );

            let note = iexpect!(note_opt, status::InternalServerError);

            let dto: NoteDTO = note.into();

            create_response(&dto)
        });
    }

    // PUT /notes/:id
    {
        let storage = storage.clone();
        router.put("/notes/:id", move |req: &mut Request| {
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
                return Ok(Response::with(status::NotFound));
            }

            // return updated note
            let note_opt = itry!(storage.get_note(id), status::InternalServerError);
            let note = iexpect!(note_opt, status::InternalServerError);

            let dto: NoteDTO = note.into();

            create_response(&dto)
        });
    }

    // GET /notes/:id
    {
        let storage = storage.clone();
        router.get("/notes/:id", move |req: &mut Request| {
            let id = itry!(get_id(req), status::BadRequest);

            let note_opt = itry!(storage.get_note(id));
            let note = iexpect!(note_opt, status::NotFound);

            let dto: NoteDTO = note.into();

            create_response(&dto)
        });
    }

    // DELETE /notes/:id
    {
        let storage = storage.clone();
        router.delete("/notes/:id", move |req: &mut Request| {
            let id = itry!(get_id(req), status::BadRequest);

            let status = if itry!(storage.remove_note(id)) {
                status::Ok
            } else {
                status::NotFound
            };

            Ok(Response::with(status))
        });
    }

    println!("running server on {}", addr);

    Iron::new(LoggerHandler::new(router)).http(addr).expect("failed to run server");
}
