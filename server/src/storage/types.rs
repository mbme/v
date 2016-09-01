use time::Timespec;
use error::{Result, Error};

pub type Id = u64;

#[derive(Eq, PartialEq, Debug)]
pub struct Blob(pub Vec<u8>);

impl Blob {
    pub fn size(&self) -> usize {
        self.0.len()
    }
}

#[derive(Eq, PartialEq, Debug)]
pub enum RecordType {
    Note,
}

impl RecordType {
    pub fn to_string(&self) -> String {
        match *self {
            RecordType::Note => "note".to_string(),
        }
    }
}

impl ::std::str::FromStr for RecordType {
    type Err = Error;

    fn from_str(s: &str) -> Result<RecordType> {
        match s {
            "note" => Ok(RecordType::Note),
            _ => Err(Error::from_str(format!("unknown record type {}", s))),
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
