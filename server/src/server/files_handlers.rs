use std::sync::Arc;

use iron::prelude::*;
use iron::status;
use iron::Handler;

use mime_guess::guess_mime_type;

use super::dto::*;
use super::utils::*;
use super::multipart::{parse_multipart, RequestData};

use utils::convert_all_into;
use error::Error;
use storage::Storage;
use storage::types::*;

fn assert_record_exists (storage: &Storage, id: Id) -> IronResult<()> {
    if itry!(storage.record_exists(id, None)) {
        Ok(())
    } else {
        let msg = format!("Can't find record with id {}", id);
        Err(IronError::new(Error::from_str(msg), status::NotFound))
    }
}


pub struct ListFilesHandler(pub Arc<Storage>);
impl Handler for ListFilesHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.0, id)?;

        let files = itry!(self.0.list_record_files(id));

        let dtos: Vec<FileInfoDTO> = convert_all_into(files);

        create_response(&dtos)
    }
}

pub struct AddFileHandler(pub Arc<Storage>);
impl Handler for AddFileHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // extract :id
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.0, id)?;

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

                let info = itry!(self.0.add_file(id, name, data));

                let info_dto: FileInfoDTO = info.into();

                create_response(&info_dto)
            },
            _ => Ok(Response::with(status::BadRequest)),
        }
    }
}

pub struct GetFileHandler(pub Arc<Storage>);
impl Handler for GetFileHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // extract :id
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.0, id)?;

        // extract file :name
        let name = itry!(get_url_param(req, "name"), status::BadRequest);

        // read and send file
        if let Some(blob) = itry!(self.0.get_file(id, &name)) {
            Ok(Response::with((guess_mime_type(name), status::Ok, blob.0)))
        } else {
            Err(IronError::new(Error::from_str("Can't find file"), status::NotFound))
        }
    }
}

pub struct RemoveFileHandler(pub Arc<Storage>);
impl Handler for RemoveFileHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // extract :id
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.0, id)?;

        // extract file :name
        let name = itry!(get_url_param(req, "name"), status::BadRequest);

        // delete file
        if itry!(self.0.remove_file(id, &name)) {
            Ok(Response::with(status::Ok))
        } else {
            Err(IronError::new(Error::from_str("Can't find file"), status::NotFound))
        }
    }
}
