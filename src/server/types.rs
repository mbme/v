use std::fmt;
use std::str;
use errors::{Error, Result};

#[derive(Hash, PartialEq, Eq, Debug)]
pub enum ActionType {
    ListRecords,
    CreateNote,
    ReadNote,
    UpdateNote,
    DeleteNote,
}

impl fmt::Display for ActionType {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        let result = match *self {
            ActionType::ListRecords => "list-records",
            ActionType::CreateNote => "create-note",
            ActionType::ReadNote => "read-note",
            ActionType::UpdateNote => "update-note",
            ActionType::DeleteNote => "delete-note",
        };

        write!(fmt, "{}", result)
    }
}

impl str::FromStr for ActionType {
    type Err = Error;

    fn from_str(s: &str) -> Result<ActionType> {
        match s {
            "list-records" => Ok(ActionType::ListRecords),
            "create-note" => Ok(ActionType::CreateNote),
            "read-note" => Ok(ActionType::ReadNote),
            "update-note" => Ok(ActionType::UpdateNote),
            "delete-note" => Ok(ActionType::DeleteNote),
            _ => Err(Error::UnknownActionType(s.to_string())),
        }
    }
}
