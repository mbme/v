use time::Timespec;
use error::{Result, Error};
use std::str;
use std::fmt;

pub type Id = u64;

#[derive(Eq, PartialEq, Debug)]
pub struct Blob(pub Vec<u8>);

impl Blob {
    pub fn size(&self) -> usize {
        self.0.len()
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
    pub create_ts: Timespec,
    pub update_ts: Timespec,
}

pub struct Note {
    pub record: Record,
    pub data: String,
    pub files: Vec<FileInfo>,
}

pub struct Project {
    pub record: Record,
    pub description: String,
}

pub enum TodoState {
    Inbox,
    Todo,
    InProgress,
    Blocked,
    Done,
    Canceled,
}

impl fmt::Display for TodoState {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        let result = match *self {
            TodoState::Inbox      => "inbox",
            TodoState::Todo       => "todo",
            TodoState::InProgress => "in-progress",
            TodoState::Blocked    => "blocked",
            TodoState::Done       => "done",
            TodoState::Canceled   => "canceled",
        };

        write!(fmt, "{}", result)
    }
}

impl str::FromStr for TodoState {
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
