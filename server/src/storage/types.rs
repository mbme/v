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

pub struct Record {
    pub id: Id,
    pub name: String,
    pub create_ts: Timespec,
    pub update_ts: Timespec,
}

impl Record {
    pub fn new(id: Id, name: String, create_ts: Timespec, update_ts: Timespec) -> Record {
        Record {
            id: id,
            name: name,
            create_ts: create_ts,
            update_ts: update_ts,
        }
    }
}

pub struct Note {
    pub record: Record,
    pub data: String,
}

impl Note {
    pub fn new(rec: Record, data: String) -> Note {
        Note {
            record: rec,
            data: data,
        }
    }
}
