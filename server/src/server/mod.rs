mod logger;
mod dto;
mod multipart;
mod utils;
mod notes_handlers;
mod static_handlers;
mod files_handlers;

use std::sync::Arc;
use std::fs;

use iron::prelude::*;
use iron::status;
use router::Router;
use mime_guess::guess_mime_type;

use storage::Storage;
use error::Error;
use config::Config;

use self::logger::Logger;
use self::dto::*;
use self::multipart::{parse_multipart, RequestData};
use self::notes_handlers::*;
use self::static_handlers::*;
use self::files_handlers::*;
use self::utils::{create_response, get_id, get_url_param};

pub const UI_APP_VERSION: &'static str = include_str!("../../../web-client/prod/VERSION");

pub fn start_server(config: &Config) {

    // print DB file size
    if let Ok(metadata) = fs::metadata(&config.db_file) {
        println!("db file size: {:.3} MB", metadata.len() as f64 / 1024.0 / 1024.0);
    }

    let storage = Storage::new(&config.db_file).expect("failed to open db");

    storage.init().expect("failed to init DB");

    let storage = Arc::new(storage);

    let mut router = Router::new();

    // NOTES
    router.get("/api/notes", ListNotesHandler(storage.clone()), "get note records");
    router.post("/api/notes", AddNoteHandler(storage.clone()), "add note");
    router.put("/api/notes/:id", UpdateNoteHandler(storage.clone()), "update note");
    router.get("/api/notes/:id", GetNoteHandler(storage.clone()), "get note");
    router.delete("/api/notes/:id", DeleteNoteHandler(storage.clone()), "delete note");

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

    // POST /api/records/:id/files
    {
        let storage = storage.clone();
        router.post("/api/records/:id/files", move |req: &mut Request| {
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
        }, "add record file");
    }

    // GET /api/records/:id/files/:name
    {
        let storage = storage.clone();
        router.get("/api/records/:id/files/:name", move |req: &mut Request| {
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
        }, "get record file");
    }

    // DELETE /api/records/:id/files/:name
    {
        let storage = storage.clone();
        router.delete("/api/records/:id/files/:name", move |req: &mut Request| {
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

        }, "delete record file");
    }

    // Serve static files
    router.get("/", StaticIndexHandler, "static index handler");
    router.get("/*", StaticFilesHandler::new(), "static files handler");

    println!("running server on {}", &config.server_address);

    let mut chain = Chain::new(router);

    chain.link_before(Logger);
    chain.link_after(Logger);

    Iron::new(chain).http(&config.server_address as &str).expect("failed to run server");
}
