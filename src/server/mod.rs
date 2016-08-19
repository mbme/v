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
// use std::collections::{HashSet, BTreeMap};

// fn parse_request(req: Request) -> Result<Action> {
//     use hyper::method::Method;

//     if req.matches(Method::Post, "/api", false) {
//         request::parse_action(req)
//     } else if req.matches(Method::Post, "/files", false) {
//         request::add_file_action(req)
//     } else if req.matches(Method::Get, "/files/", true) {
//         let url = req.get_request_url();
//         let file_id = url.trim_left_matches("/files/");
//         request::get_file_action(file_id.into())
//     } else if req.matches(Method::Delete, "/files/", true) {
//         let url = req.get_request_url();
//         let file_id = url.trim_left_matches("/files/");
//         request::remove_file_action(file_id.into())
//     } else {
//         Err(Error::ActionProcessingError(
//             format!("unsupported request {} {}", req.method, req.uri)
//         ))
//     }
// }

// fn process_action(action: Action, s: &Storage, res: Response) {
//     match action {
//         Action::ListRecords => {
//             match s.list_records()
//                 .and_then(|records| to_json(&records)) {
//                     Ok(bin) => res.write_all(bin),
//                     Err(err) => res.write_all(bin),
//             }
//         },

//         Action::CreateNote { name, data, categories } => {
//             let id = try!(s.add_note(&name, &data, &categories));
//             let note = try!(s.get_note(id));

//             to_json(&note)
//         },

//         Action::GetNote(id) => {
//             let note = try!(s.get_note(id));

//             to_json(&note)
//         }

//         Action::UpdateNote { id, name, data, categories } => {
//             let mut note = try!(s.get_note(id));

//             note.record.name = name;
//             note.record.categories = categories;
//             note.data = data;

// try!(s.update_note(&note));

// let note = try!(s.get_note(id));

//             to_json(&note)
//         }

//         Action::RemoveNote(id) => {
//             try!(s.remove_note(id));

//             Ok(vec![])
//         }

//         Action::AddFile { name, data } => {
//             try!(s.add_file(&name, &data));

//             Ok(vec![])
//         }

//         Action::GetFile(id) => {
//             let data = try!(s.get_file(id));

//             Ok(data)
//         }

//         Action::RemoveFile(id) => {
//             try!(s.remove_file(id));

//             Ok(vec![])
//         }
//     }
// }


// fn handle_request(req: Request, res: Response, s: &Storage) {
//     let result = parse_request(req).and_then(
//         |action| process_action(action, s)
//     );
// }

// fn into_json_bytes<T: json::ToJson>(x: &T) -> Result<Vec<u8>> {
//     json::encode(&x.to_json())
//         .map(|s| s.into())
//         .map_err(|err| Error::new(box err, "failed to serialize into json"))
// }

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


// fn json_as_obj(json: &mut Json) -> Result<&mut Object> {
//     json.as_object_mut().ok_or(Error::from_str("can't cast to object"))
// }

// fn get_obj_prop<'a>(obj: &'a Object, prop: &str) -> Result<&'a Json> {
//     obj.get(prop)
//         .ok_or(Error::from_str(format!("can't find property '{}'", prop)))
// }

// fn json_as_string(json: &Json) -> Result<&str> {
//     json.as_string()
//         .ok_or(Error::from_str("can't cast to string"))
// }


// fn get_obj_string<'a>(obj: &'a Object, prop: &str) -> Result<&'a str> {
//     get_obj_prop(obj, prop).and_then(json_as_string)
// }

// fn json_as_arr(json: &Json) -> Result<&Vec<Json>> {
//     json.as_array()
//         .ok_or(Error::from_str("can't cast to array"))
// }


// fn parse_categories(json: &Json) -> Result<types::Categories> {

//     let arr = try!(json_as_arr(json));

//     let mut str_arr = vec![];
//     for json in arr {
//         match json_as_string(json) {
//             Ok(val) => str_arr.push(val),
//             Err(e) => return Err(e),
//         }
//     }

//     Ok(types::into_categories(str_arr))
// }

// fn parse_create_note(req: &mut Request) -> Result<(String, String, types::Categories)> {
//     let body = try!(get_request_body(req).map_err(into_err));
//     let mut json = try!(Json::from_str(&body).map_err(into_err));
//     let obj = try!(json_as_obj(&mut json));

//     let name = try!(get_obj_string(obj, "name"));
//     let data = try!(get_obj_string(obj, "data"));

//     let categories = try!(
//         get_obj_prop(obj, "categories").and_then(|json| parse_categories(json))
//     );

//     Ok((name.into(), data.into(), categories))
// }

// fn into_response<T: json::ToJson>(data: &T) -> IronResult<Response> {
//     let data = itry!(into_json_bytes(data), status::InternalServerError);

//     let content_type = "application/json".parse::<Mime>().unwrap();

//     Ok(Response::with((content_type, status::Ok, data)))
// }

#[derive(Debug, Deserialize)]
struct CreateNoteDTO {
    name: String,
    data: String,
    categories: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct UpdateNoteDTO {
    name: String,
    data: String,
    categories: Vec<String>,
}

#[derive(Debug, Serialize)]
struct RecordDTO {
    id: Id,
    name: String,
    create_ts: i64,
    update_ts: i64,
    categories: RawCategories,
}

#[derive(Debug, Serialize)]
struct NoteDTO {
    id: Id,
    name: String,
    create_ts: i64,
    update_ts: i64,
    categories: RawCategories,
    data: String,
}

fn rec_to_dto (rec: Record) -> RecordDTO {
    RecordDTO {
        id: rec.id,
        name: rec.name,
        create_ts: rec.create_ts.sec,
        update_ts: rec.update_ts.sec,
        categories: cats_into_vec(rec.categories),
    }
}

fn note_to_dto(note: Note) -> NoteDTO {
    NoteDTO {
        id: note.record.id,
        name: note.record.name,
        create_ts: note.record.create_ts.sec,
        update_ts: note.record.update_ts.sec,
        categories: cats_into_vec(note.record.categories),
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
    use storage::storage::Storage;
    use db;
    use std::sync::Arc;

    let storage_ = Arc::new(Storage::new(db::in_mem_provider()));

    let mut router = Router::new();

    // GET /records
    let storage = storage_.clone();
    router.get("/records", move |_req: &mut Request| {

        let records = itry!(storage.list_records(), status::InternalServerError);

        let dtos = records.into_iter().map(rec_to_dto).collect::<Vec<RecordDTO>>();

        create_response(&dtos)
    });

    // POST /notes
    let storage = storage_.clone();
    router.post("/notes", move |req: &mut Request| {
        // parse request body
        let body = itry!(
            get_request_body(req), status::BadRequest
        );
        let dto: CreateNoteDTO = itry!(
            serde_json::from_str(&body), status::BadRequest
        );

        let id = itry!(
            storage.add_note(&dto.name, &dto.data, &into_categories(dto.categories)),
            status::InternalServerError
        );

        let note_opt = itry!(
            storage.get_note(id),
            status::InternalServerError
        );

        let note = iexpect!(note_opt, status::InternalServerError);

        create_response(&note_to_dto(note))
    });

    // PUT /notes/:id
    let storage = storage_.clone();
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
            storage.update_note(id, &dto.name, &dto.data, &into_categories(dto.categories)),
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

    // GET /notes/:id
    let storage = storage_.clone();
    router.get("/notes/:id", move |req: &mut Request| {
        let id = itry!(get_id(req), status::BadRequest);

        let note_opt = itry!(storage.get_note(id));
        let note = iexpect!(note_opt, status::NotFound);

        create_response(&note_to_dto(note))
    });

    // DELETE /notes/:id
    let storage = storage_.clone();
    router.delete("/notes/:id", move |req: &mut Request| {
        let id = itry!(get_id(req), status::BadRequest);

        let status = if itry!(storage.remove_note(id)) {
            status::Ok
        } else {
            status::NotFound
        };

        Ok(Response::with(status))
    });

    println!("running server on {}", addr);

    Iron::new(LoggerHandler::new(router)).http(addr).expect("failed to run server");
}
