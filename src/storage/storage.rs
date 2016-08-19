use std::collections::HashSet;
use std::sync::{Mutex, MutexGuard};
use rusqlite::Connection;

use error::{Result, into_err};
use storage::types::*;

use storage::db::{RecordProp, DB};

fn in_mem_conn() -> Result<Connection> {
    Connection::open_in_memory().map_err(into_err)
}

fn cats_into_params(cats: &Categories) -> Vec<(RecordProp, &str)> {
    let mut params = vec![];
    let categories: Vec<_> = cats.iter().map(|c| &c.0 as &str).collect();
    for cat in categories {
        params.push((RecordProp::Category, cat));
    }

    params
}

pub struct Storage {
    conn: Mutex<Connection>,
}

impl Storage {
    pub fn new(conn: Connection) -> Storage {
        Storage { conn: Mutex::new(conn) }
    }

    pub fn in_mem() -> Storage {
        Storage::new(in_mem_conn().expect("failed to open in-mem connection"))
    }

    fn conn_mutex(&self) -> MutexGuard<Connection> {
        self.conn.lock().unwrap()
    }

    pub fn init(&self) -> Result<()> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        {
            let db = DB::new(&tx);
            db.init_schema()?;
        }

        tx.commit()?;

        Ok(())
    }

    pub fn list_records(&self) -> Result<Vec<Record>> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let mut res = Vec::new();

        {
            let db = DB::new(&tx);

            let records = db.get_records()?;
            let mut categories = db.get_records_categories()?;

            // create list of records
            for (id, name, create_ts, update_ts) in records {
                // add record categories
                let cats = categories.remove(&id).unwrap_or_default();

                res.push(Record::new(id, name, create_ts, update_ts, cats));
            }
        }

        tx.commit()?;

        Ok(res)
    }

    pub fn add_note(&self, name: &str, data: &str, categories: &Categories) -> Result<Id> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        // add new record
        let id = {
            let db = DB::new(&tx);
            let id = db.add_record(name, &RecordType::Note.to_string())?;

            // add record props
            let mut params = vec![(RecordProp::Data, data)];
            for cat in categories {
                params.push((RecordProp::Category, &cat.0));
            }

            db.add_record_props(id, &params)?;

            id
        };

        tx.commit()?;

        Ok(id)
    }

    pub fn get_note(&self, id: Id) -> Result<Option<Note>> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let note = {
            let db = DB::new(&tx);

            let mut data = "".to_string();
            let mut categories = HashSet::new();

            let result = db.get_record(id, &RecordType::Note.to_string());

            let (name, create_ts, update_ts) = match result? {
                Some(data) => data,
                None => return Ok(None),
            };

            let props = db.get_record_props(id, &[RecordProp::Data, RecordProp::Category])?;
            for (prop, val) in props {
                match prop {
                    RecordProp::Data => data = val,
                    RecordProp::Category => {
                        categories.insert(val);
                    }
                }
            }
            let categories = categories.into_iter().map(Category).collect();

            let rec = Record::new(id, name, create_ts, update_ts, categories);

            Note::new(rec, data)
        };

        tx.commit()?;

        Ok(Some(note))
    }

    pub fn update_note(&self, id: Id, name: &str, data: &str, categories: &Categories) -> Result<bool> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let updated = {
            let db = DB::new(&tx);

            // update name
            let updated = db.update_record(id, name)?;

            // update props if note with specified id exists
            if updated {
                // delete old props
                db.remove_record_props(id)?;

                // add new record props
                let mut params = cats_into_params(categories);
                params.push((RecordProp::Data, data));

                db.add_record_props(id, &params)?;
            }

            updated
        };

        tx.commit()?;

        Ok(updated)
    }

    pub fn remove_note(&self, id: Id) -> Result<bool> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let removed = {
            let db = DB::new(&tx);

            let removed = db.remove_record(id)?;

            // remove props if note with specified id exists
            if removed {
                db.remove_record_props(id)?;
            }

            removed
        };

        tx.commit()?;

        Ok(removed)
    }

    pub fn add_file(&self, name: &str, data: &Blob) -> Result<Id> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let result = {
            let db = DB::new(&tx);

            db.add_file(name, data).map_err(into_err)
        };

        tx.commit()?;

        result
    }

    pub fn get_file(&self, id: Id) -> Result<Option<Blob>> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let result = {
            let db = DB::new(&tx);

            db.get_file(id).map_err(into_err)
        };

        tx.commit()?;

        result
    }

    pub fn remove_file(&self, id: Id) -> Result<bool> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let result = {
            let db = DB::new(&tx);

            db.remove_file(id)
        };

        tx.commit()?;

        result
    }
}

#[cfg(test)]
mod viter {
    use storage::storage::*;
    use storage::types::{into_categories, Categories};

    fn new_storage() -> Storage {
        let storage = Storage::in_mem();
        storage.init().expect("failed to init DB");
        storage
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
