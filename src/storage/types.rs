use time::Timespec;
use std::collections::HashSet;

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

#[derive(Hash, PartialEq, Eq, Debug, Clone)]
pub struct Category(pub String);

pub type Categories = HashSet<Category>;

pub type RawCategories = Vec<String>;

pub fn into_categories<T: Into<String>>(c: Vec<T>) -> Categories {
    let mut cats = Categories::new();
    for cat in c {
        cats.insert(Category(cat.into()));
    }
    cats
}

pub fn cats_into_vec(c: Categories) -> RawCategories {
    c.into_iter().map(|c| c.0).collect()
}

pub struct Record {
    pub id: Id,
    pub name: String,
    pub create_ts: Timespec,
    pub update_ts: Timespec,
    pub categories: Categories,
}

impl Record {
    pub fn new(id: Id,
               name: String,
               create_ts: Timespec,
               update_ts: Timespec,
               cats: Categories)
               -> Record {
        Record {
            id: id,
            name: name,
            create_ts: create_ts,
            update_ts: update_ts,
            categories: cats,
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
            data:   data,
        }
    }
}
