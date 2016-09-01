mod logger;

use iron::prelude::*;
use iron::status;
use router::Router;
use iron::mime::Mime;
use serde::Serialize;
use serde_json;

use storage::types::*;
use ::error::{Result, Error, into_err};

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

#[derive(Debug, Deserialize)]
struct CreateNoteDTO {
    name: String,
    data: String,
}

#[derive(Debug, Deserialize)]
struct UpdateNoteDTO {
    name: String,
    data: String,
}

#[derive(Debug, Serialize)]
struct RecordDTO {
    id: Id,
    name: String,
    create_ts: i64,
    update_ts: i64,
}

#[derive(Debug, Serialize)]
struct NoteDTO {
    id: Id,
    name: String,
    create_ts: i64,
    update_ts: i64,
    data: String,
}

fn rec_to_dto (rec: Record) -> RecordDTO {
    RecordDTO {
        id: rec.id,
        name: rec.name,
        create_ts: rec.create_ts.sec,
        update_ts: rec.update_ts.sec,
    }
}

fn note_to_dto(note: Note) -> NoteDTO {
    NoteDTO {
        id: note.record.id,
        name: note.record.name,
        create_ts: note.record.create_ts.sec,
        update_ts: note.record.update_ts.sec,
        data: note.data,
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

            let dtos = records.into_iter().map(rec_to_dto).collect::<Vec<RecordDTO>>();

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

            create_response(&note_to_dto(note))
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

            create_response(&note_to_dto(note))
        });
    }

    // GET /notes/:id
    {
        let storage = storage.clone();
        router.get("/notes/:id", move |req: &mut Request| {
            let id = itry!(get_id(req), status::BadRequest);

            let note_opt = itry!(storage.get_note(id));
            let note = iexpect!(note_opt, status::NotFound);

            create_response(&note_to_dto(note))
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
