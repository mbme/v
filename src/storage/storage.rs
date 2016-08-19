use std::collections::HashSet;

use ::error::{Result, into_err};
use super::types::{Blob, Categories, Category, Id, Note, Record, RecordType};
use db::{ConnectionProvider, DBUtils, RecordProp};

fn cats_into_params<'a>(cats: &'a Categories) -> Vec<(RecordProp, &'a str)> {
    let mut params = vec![];
    let categories: Vec<_> = cats.iter().map(|c| &c.0 as &str).collect();
    for cat in categories {
        params.push((RecordProp::Category, cat));
    }

    params
}

pub struct Storage {
    provider: Box<ConnectionProvider>,
}

// TODO destructor to close connections
impl Storage {
    pub fn new(provider: Box<ConnectionProvider>) -> Storage {
        Storage { provider: provider }
    }

    pub fn list_records(&self) -> Result<Vec<Record>> {
        let conn = self.provider.conn();

        let records = try!(conn.get_records());
        let mut categories = try!(conn.get_records_categories());

        let mut res = Vec::new();

        // create list of records
        for (id, name, create_ts, update_ts) in records {
            // add record categories
            let cats = categories.remove(&id).unwrap_or(Categories::new());

            res.push(Record::new(id, name, create_ts, update_ts, cats));
        }

        Ok(res)
    }

    pub fn add_note(&self, name: &str, data: &str, categories: &Categories) -> Result<Id> {
        let mut conn = self.provider.conn();

        let tx = try!(conn.transaction());

        // add new record
        let id = try!(tx.add_record(name, &RecordType::Note.to_string()));

        // add record props
        let mut params = vec![(RecordProp::Data, data)];
        for cat in categories {
            params.push((RecordProp::Category, &cat.0));
        }

        try!(tx.add_record_props(id, &params));

        try!(tx.commit());

        Ok(id)
    }

    pub fn get_note(&self, id: Id) -> Result<Option<Note>> {
        let mut data = "".to_string();
        let mut categories = HashSet::new();

        let conn = self.provider.conn();

        let result = conn.get_record(id, &RecordType::Note.to_string());

        let (name, create_ts, update_ts) = match try!(result) {
            Some(data) => data,
            None => return Ok(None),
        };

        let props = try!(conn.get_record_props(id, &[RecordProp::Data, RecordProp::Category]));
        for (prop, val) in props {
            match prop {
                RecordProp::Data => data = val,
                RecordProp::Category => {
                    categories.insert(val);
                }
            }
        }
        let categories = categories.into_iter().map(|s| Category(s)).collect();

        let rec = Record::new(id, name, create_ts, update_ts, categories);
        let note = Note::new(rec, data);

        Ok(Some(note))
    }

    pub fn update_note(&self, id: Id, name: &str, data: &str, categories: &Categories) -> Result<bool> {
        let mut conn = self.provider.conn();
        let tx = try!(conn.transaction());

        // update name
        let updated = tx.update_record(id, name)?;

        // update props if note with specified id exists
        if updated {
            // delete old props
            try!(tx.remove_record_props(id));

            // add new record props
            let mut params = cats_into_params(categories);
            params.push((RecordProp::Data, data));

            try!(tx.add_record_props(id, &params));
        }

        try!(tx.commit());

        Ok(updated)
    }

    pub fn remove_note(&self, id: Id) -> Result<bool> {
        let mut conn = self.provider.conn();
        let tx = conn.transaction()?;

        let removed = tx.remove_record(id)?;

        // remove props if not with specified id exists
        if removed {
            try!(tx.remove_record_props(id));
        }

        try!(tx.commit());

        Ok(removed)
    }

    pub fn add_file(&self, name: &str, data: &Blob) -> Result<Id> {
        self.provider.conn().add_file(name, data).map_err(into_err)
    }

    pub fn get_file(&self, id: Id) -> Result<Option<Blob>> {
        self.provider.conn().get_file(id).map_err(into_err)
    }

    pub fn remove_file(&self, id: Id) -> Result<bool> {
        self.provider.conn().remove_file(id)
    }
}

#[cfg(test)]
mod viter {
    use db;
    use storage::storage::*;
    use storage::types::{into_categories, Categories};

    fn new_storage() -> Storage {
        Storage::new(db::in_mem_provider())
    }

    fn empty_categories() -> Categories {
        into_categories::<String>(vec![])
    }

    #[test]
    fn test_add_note() {
        println!("start test add note");
        let s = new_storage();
        s.add_note("test", "data", &empty_categories()).unwrap();
        println!("end test add note");
    }


    #[test]
    fn test_get_note() {
        println!("start test get note");
        let s = new_storage();
        let name = "test";
        let data = "data";
        let cats = into_categories(vec!["123", "test"]);
        let id = s.add_note(name, data, &cats).unwrap();

        let note = s.get_note(id).unwrap().unwrap();
        assert_eq!(note.record.name, name);
        assert_eq!(note.data, data);
        assert_eq!(note.record.categories, cats);
        println!("end test get note");
    }

    #[test]
    fn test_update_note() {
        println!("start test update note");
        let s = new_storage();
        let name = "test";
        let data = "data";
        let cats = into_categories(vec!["123", "test"]);
        let id = s.add_note(name, data, &cats).unwrap();

        let new_name = "test1".to_string();
        let new_categories = into_categories(vec!["23"]);
        s.update_note(id, &new_name, data, &new_categories).unwrap();

        let new_note = s.get_note(id).unwrap().unwrap();
        assert!(new_note.record.name == new_name);
        assert!(new_note.data == data);
        assert!(new_note.record.categories == new_categories);
        assert!(new_note.record.categories != cats);
        println!("end test update note");
    }

    #[test]
    fn test_remove_note() {
        println!("start test remove note");
        let s = new_storage();
        let id = s.add_note("test", "data", &empty_categories()).unwrap();
        s.get_note(id).unwrap();

        s.remove_note(id).unwrap();

        assert!(s.get_note(id).unwrap().is_none());
        println!("end test remove note");
    }

    #[test]
    fn test_add_file() {
        println!("start test add file");
        let s = new_storage();
        s.add_file("test", &b"test".to_vec()).unwrap();
        println!("end test add file");
    }

    #[test]
    fn test_get_file() {
        println!("start get file");
        let s = new_storage();
        let data = b"test".to_vec();
        let id = s.add_file("test", &data).unwrap();

        let file = s.get_file(id).unwrap().unwrap();
        assert_eq!(data, file);
        println!("end get file");
    }

    #[test]
    fn test_remove_file() {
        println!("start remove file");
        let s = new_storage();
        let id = s.add_file("test", &b"test".to_vec()).unwrap();

        assert!(s.get_file(id).is_ok());

        s.remove_file(id).unwrap();

        assert!(s.get_file(id).is_err());
        println!("end remove file");
    }

    #[test]
    fn test_list_records() {
        println!("start list records");

        let s = new_storage();
        s.add_note("test", "data", &empty_categories()).unwrap();

        assert!(s.list_records().unwrap().len() == 1);
        println!("end list records");
    }
}
