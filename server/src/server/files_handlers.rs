use std::sync::Arc;

use iron::prelude::*;
use iron::status;
use iron::Handler;

use storage::Storage;
use storage::types::RecordType;

pub struct GetFileHandler{
    pub record_type: RecordType,
    pub storage: Arc<Storage>,
}

impl GetFileHandler {
    pub fn new(record_type: RecordType, storage: Arc<Storage>) -> GetFileHandler {
        GetFileHandler {
            record_type: record_type,
            storage: storage,
        }
    }
}
impl Handler for GetFileHandler {
    fn handle(&self, _: &mut Request) -> IronResult<Response> {
        let records = itry!(
            self.0.list_note_records(),
            status::InternalServerError
        );

        let dtos: Vec<RecordDTO> = convert_all_into(records);

        create_response(&dtos)
    }
}
