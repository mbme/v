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

fn assert_record_exists (storage: &Storage, id: Id, record_type: RecordType) -> IronResult<()> {
    if itry!(storage.record_exists(id, record_type)) {
        Ok(())
    } else {
        let msg = format!("Can't find {} with id {}", record_type, id);
        Err(IronError::new(Error::from_str(msg), status::NotFound))
    }
}


pub struct ListFilesHandler {
    pub record_type: RecordType,
    pub storage: Arc<Storage>,
}
impl ListFilesHandler {
    pub fn new(record_type: RecordType, storage: Arc<Storage>) -> ListFilesHandler {
        ListFilesHandler { record_type: record_type, storage: storage }
    }
}
impl Handler for ListFilesHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.storage, id, self.record_type)?;

        let files = itry!(self.storage.list_record_files(id));

        let dtos: Vec<FileInfoDTO> = convert_all_into(files);

        create_response(&dtos)
    }
}

pub struct AddFileHandler {
    pub record_type: RecordType,
    pub storage: Arc<Storage>,
}
impl AddFileHandler {
    pub fn new(record_type: RecordType, storage: Arc<Storage>) -> AddFileHandler {
        AddFileHandler { record_type: record_type, storage: storage }
    }
}
impl Handler for AddFileHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // extract :id
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.storage, id, self.record_type)?;

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

                let info = itry!(self.storage.add_file(id, name, data));

                let info_dto: FileInfoDTO = info.into();

                create_response(&info_dto)
            },
            _ => Ok(Response::with(status::BadRequest)),
        }
    }
}

pub struct GetFileHandler {
    pub record_type: RecordType,
    pub storage: Arc<Storage>,
}
impl GetFileHandler {
    pub fn new(record_type: RecordType, storage: Arc<Storage>) -> GetFileHandler {
        GetFileHandler { record_type: record_type, storage: storage }
    }
}
impl Handler for GetFileHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // extract :id
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.storage, id, self.record_type)?;

        // extract file :name
        let name = itry!(get_url_param(req, "name"), status::BadRequest);

        // read and send file
        if let Some(blob) = itry!(self.storage.get_file(id, &name)) {
            Ok(Response::with((guess_mime_type(name), status::Ok, blob.0)))
        } else {
            Err(IronError::new(Error::from_str("Can't find file"), status::NotFound))
        }
    }
}

pub struct RemoveFileHandler {
    pub record_type: RecordType,
    pub storage: Arc<Storage>,
}
impl RemoveFileHandler {
    pub fn new(record_type: RecordType, storage: Arc<Storage>) -> RemoveFileHandler {
        RemoveFileHandler { record_type: record_type, storage: storage }
    }
}
impl Handler for RemoveFileHandler {
    fn handle(&self, req: &mut Request) -> IronResult<Response> {
        // extract :id
        let id = itry!(get_id(req), status::BadRequest);
        assert_record_exists(&self.storage, id, self.record_type)?;

        // extract file :name
        let name = itry!(get_url_param(req, "name"), status::BadRequest);

        // delete file
        if itry!(self.storage.remove_file(id, &name)) {
            Ok(Response::with(status::Ok))
        } else {
            Err(IronError::new(Error::from_str("Can't find file"), status::NotFound))
        }
    }
}
