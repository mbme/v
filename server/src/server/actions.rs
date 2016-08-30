use storage::types::{Categories, Id, Blob};

pub enum Action {
    ListRecords,
    CreateNote {
        name:       String,
        data:       String,
        categories: Categories,
    },
    GetNote(Id),
    UpdateNote {
        id:         Id,
        name:       String,
        data:       String,
        categories: Categories,
    },
    RemoveNote(Id),
    AddFile {
        name: String,
        data: Blob,
    },
    GetFile(Id),
    RemoveFile(Id),
}

pub const LIST_RECORDS: &'static str = "list-records";

pub const CREATE_NOTE:  &'static str = "create-note";
pub const GET_NOTE:     &'static str = "get-note";
pub const UPDATE_NOTE:  &'static str = "update-note";
pub const REMOVE_NOTE:  &'static str = "remove-note";
