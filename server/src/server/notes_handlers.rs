use std::sync::Arc;

use utils::convert_all_into;
use error::Error;
use storage::Storage;

use super::dto::*;
use super::utils::*;

use iron::prelude::*;
use iron::status;
use iron::Handler;

use serde_json;

pub struct ListNotesHandler(pub Arc<Storage>);
impl Handler for ListNotesHandler {
    fn handle(&self, _: &mut Request) -> IronResult<Response> {
        let records = itry!(
            self.0.list_note_records(),
            status::InternalServerError
        );

        let dtos: Vec<RecordDTO> = convert_all_into(records);

        create_response(&dtos)
    }
}

pub struct AddNoteHandler(pub Arc<Storage>);
impl Handler for AddNoteHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // parse request body
        let body = itry!(
            get_request_body(req), status::BadRequest
        );
        let dto: CreateNoteDTO = itry!(
            serde_json::from_str(&body), status::BadRequest
        );

        let id = itry!(
            self.0.add_note(&dto.name, &dto.data),
            status::InternalServerError
        );

        let note_opt = itry!(self.0.get_note(id));
        let note = itry!(
            note_opt.ok_or(Error::from_str("Can't find note")),
            status::NotFound
        );

        let dto: NoteDTO = note.into();

        create_response(&dto)
    }
}

pub struct UpdateNoteHandler(pub Arc<Storage>);
impl Handler for UpdateNoteHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
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
            self.0.update_note(id, &dto.name, &dto.data),
            status::InternalServerError
        );

        if !updated {
            return Err(IronError::new(Error::from_str("Can't find note"), status::NotFound));
        }

        // return updated note
        let note = itry!(
            self.0.get_note(id)
                .and_then(|note| note.ok_or(Error::from_str("Can't find note"))),
            status::InternalServerError
        );

        let dto: NoteDTO = note.into();

        create_response(&dto)
    }
}

pub struct GetNoteHandler(pub Arc<Storage>);
impl Handler for GetNoteHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);

        let note_opt = itry!(self.0.get_note(id));
        let note = itry!(
            note_opt.ok_or(Error::from_str("Can't find note")),
            status::NotFound
        );

        let dto: NoteDTO = note.into();

        create_response(&dto)
    }
}

pub struct DeleteNoteHandler(pub Arc<Storage>);
impl Handler for DeleteNoteHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);

        if itry!(self.0.remove_note(id)) {
            Ok(Response::with(status::Ok))
        } else {
            Err(IronError::new(Error::from_str("Can't find note"), status::NotFound))
        }
    }
}
