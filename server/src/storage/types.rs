use time::Timespec;

pub type Id = u64;

pub type Blob = Vec<u8>;

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
