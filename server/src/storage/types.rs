use time::Timespec;
use error::{Result, Error};
use std::str::FromStr;

pub type Id = u64;

#[derive(Eq, PartialEq, Debug)]
pub struct Blob(pub Vec<u8>);

impl Blob {
    pub fn size(&self) -> usize {
        self.0.len()
    }
}

#[derive(Eq, PartialEq, Debug, Copy, Clone)]
pub enum RecordType {
    Note,
    Todo,
}

impl RecordType {
    pub fn to_string(&self) -> String {
        match *self {
            RecordType::Note => "note".to_string(),
            RecordType::Todo => "todo".to_string(),
        }
    }

    pub fn supports_attachments(&self) -> bool {
        match *self {
            RecordType::Note => true,
            _ => false,
        }
    }

    pub fn assert_supports_attachments(&self) -> Result<()> {
        if self.supports_attachments() {
            Ok(())
        } else {
            Error::err_from_str(format!("record type {:?} doesn't support attachments", self))
        }
    }
}

impl FromStr for RecordType {
    type Err = Error;

    fn from_str(s: &str) -> Result<RecordType> {
        match s {
            "note" => Ok(RecordType::Note),
            "todo" => Ok(RecordType::Todo),
            _ => Error::err_from_str(format!("unknown record type {}", s)),
        }
    }
}

pub struct FileInfo {
    pub name: String,
    pub size: usize,
    pub create_ts: Timespec,
}

pub struct Record {
    pub id: Id,
    pub name: String,
    pub record_type: RecordType,
    pub create_ts: Timespec,
    pub update_ts: Timespec,
}

pub struct Note {
    pub record: Record,
    pub data: String,
    pub files: Vec<FileInfo>,
}

impl Note {
    pub fn new(rec: Record, data: String, files: Vec<FileInfo>) -> Note {
        Note {
            record: rec,
            data: data,
            files: files,
        }
    }
}

pub struct Project {
    pub id: Id,
    pub name: String,
    pub description: String,
    pub create_ts: Timespec,
    pub update_ts: Timespec,
}

pub enum TodoState {
    Inbox,
    Todo,
    InProgress,
    Blocked,
    Done,
    Canceled,
}

impl TodoState {
    pub fn to_string(&self) -> String {
        match *self {
            TodoState::Inbox      => "inbox".to_string(),
            TodoState::Todo       => "todo".to_string(),
            TodoState::InProgress => "in-progress".to_string(),
            TodoState::Blocked    => "blocked".to_string(),
            TodoState::Done       => "done".to_string(),
            TodoState::Canceled   => "canceled".to_string(),
        }
    }
}

impl FromStr for TodoState {
    type Err = Error;

    fn from_str(s: &str) -> Result<TodoState> {
        match s {
            "inbox"       => Ok(TodoState::Inbox),
            "todo"        => Ok(TodoState::Todo),
            "in-progress" => Ok(TodoState::InProgress),
            "blocked"     => Ok(TodoState::Blocked),
            "done"        => Ok(TodoState::Done),
            "canceled"    => Ok(TodoState::Canceled),
            _ => Error::err_from_str(format!("unknown todo state {}", s)),
        }
    }
}

pub struct Todo {
    pub record: Record,
    pub project: Project,
    pub details: String,
    pub state: TodoState,
    pub start_ts: Option<Timespec>,
    pub end_ts: Option<Timespec>,
    pub files: Vec<FileInfo>,
}
