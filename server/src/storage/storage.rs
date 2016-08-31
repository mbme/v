use std::sync::{Mutex, MutexGuard};
use rusqlite::Connection;

use error::{Result, Error, into_err};
use storage::types::*;

use storage::db::{RecordProp, DB};

fn in_mem_conn() -> Result<Connection> {
    Connection::open_in_memory().map_err(into_err)
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

            // create list of records
            for (id, name, create_ts, update_ts) in records {
                // FIXME add files info to the record
                res.push(Record::new(id, name, create_ts, update_ts));
            }
        }

        tx.commit()?;

        Ok(res)
    }

    pub fn add_note(&self, name: &str, data: &str) -> Result<Id> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        // add new record
        let id = {
            let db = DB::new(&tx);
            let id = db.add_record(name, RecordType::Note)?;

            // add record props
            db.add_record_props(id, &[(RecordProp::Data, data)])?;

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

            let result = db.get_record(id);

            // extract results
            let (record_type, name, create_ts, update_ts) = match result? {
                Some(row) => row,
                None => return Ok(None),
            };

            if record_type != RecordType::Note {
                return Err(Error::from_str(format!("record {} is not a Note", id)));
            }

            // FIXME create db.get_record_prop(id, prop);
            let props = db.get_record_props(id, &[RecordProp::Data])?;
            for (prop, val) in props {
                match prop {
                    RecordProp::Data => data = val,
                }
            }

            let rec = Record::new(id, name, create_ts, update_ts);

            Note::new(rec, data)
        };

        tx.commit()?;

        Ok(Some(note))
    }

    pub fn update_note(&self, id: Id, name: &str, data: &str) -> Result<bool> {
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
                db.add_record_props(id, &[(RecordProp::Data, data)])?;
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

            // remove props and files if note with specified id exists
            if removed {
                db.remove_record_props(id)?;
                db.remove_record_files(id)?;
            }

            removed
        };

        tx.commit()?;

        Ok(removed)
    }

    pub fn add_file(&self, record_id: Id, name: &str, data: &Blob) -> Result<()> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let result = {
            let db = DB::new(&tx);

            if !db.record_exists(record_id)? {
                return Err(Error::from_str(format!("record {} doesn't exists", record_id)));
            }

            db.add_file(record_id, name, data).map_err(into_err)
        };

        tx.commit()?;

        result
    }

    pub fn get_file(&self, record_id: Id, name: &str) -> Result<Option<Blob>> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let result = {
            let db = DB::new(&tx);

            db.get_file(record_id, name).map_err(into_err)
        };

        tx.commit()?;

        result
    }

    pub fn remove_file(&self, record_id: Id, name: &str) -> Result<bool> {
        let mut conn = self.conn_mutex();
        let tx = conn.transaction()?;

        let result = {
            let db = DB::new(&tx);

            db.remove_file(record_id, name)
        };

        tx.commit()?;

        result
    }
}

#[cfg(test)]
mod viter {
    use storage::storage::*;
    use storage::types::Blob;

    fn new_storage() -> Storage {
        let storage = Storage::in_mem();
        storage.init().expect("failed to init DB");
        storage
    }

    fn new_blob(data: &str) -> Blob {
        Blob(data.as_bytes().to_vec())
    }

    #[test]
    fn test_add_note() {
        let s = new_storage();
        assert!(s.add_note("test", "data").is_ok());
    }


    #[test]
    fn test_get_note() {
        let s = new_storage();
        let name = "test";
        let data = "data";
        let id = s.add_note(name, data).unwrap();

        let note = s.get_note(id).unwrap().unwrap();
        assert_eq!(note.record.name, name);
        assert_eq!(note.data, data);
    }

    #[test]
    fn test_update_note() {
        let s = new_storage();
        let name = "test";
        let data = "data";
        let id = s.add_note(name, data).unwrap();

        let new_name = "test1".to_string();
        s.update_note(id, &new_name, data).unwrap();

        let new_note = s.get_note(id).unwrap().unwrap();
        assert!(new_note.record.name == new_name);
        assert!(new_note.data == data);
    }

    #[test]
    fn test_remove_note() {
        let s = new_storage();

        let id = s.add_note("test", "data").unwrap();
        assert!(s.get_note(id).unwrap().is_some());

        // add few files
        let blob = new_blob("test");
        let name = "test";
        assert!(s.add_file(id, name, &blob).is_ok());

        s.remove_note(id).unwrap();

        assert!(s.get_note(id).unwrap().is_none());
        assert!(s.get_file(id, name).unwrap().is_none());
    }

    #[test]
    fn test_add_file_to_unknown_record() {
        let s = new_storage();
        let id = 999999;
        let blob = new_blob("test");
        assert!(s.add_file(id, "test", &blob).is_err());
    }

    #[test]
    fn test_add_file() {
        let s = new_storage();
        let id = s.add_note("test", "data").unwrap();
        let blob = new_blob("test");
        assert!(s.add_file(id, "test", &blob).is_ok());
    }

    #[test]
    fn test_add_files_with_same_names() {
        let s = new_storage();
        let id = s.add_note("test", "data").unwrap();

        let blob = new_blob("test");
        let name = "test";
        assert!(s.add_file(id, name, &blob).is_ok());

        let blob1 = new_blob("test");
        let name1 = "test";
        assert!(s.add_file(id, name1, &blob1).is_err());
    }

    #[test]
    fn test_get_file() {
        let s = new_storage();
        let id = s.add_note("test", "data").unwrap();
        let name = "test";
        let blob = new_blob("test");

        assert!(s.add_file(id, name, &blob).is_ok());

        let file = s.get_file(id, name).unwrap().unwrap();
        assert_eq!(blob, file);
    }

    #[test]
    fn test_remove_file() {
        let s = new_storage();
        let id = s.add_note("test", "data").unwrap();
        let name = "test";
        let blob = new_blob("test");

        assert!(s.add_file(id, name, &blob).is_ok());

        assert!(s.remove_file(id, name).unwrap());

        assert!(s.get_file(id, name).unwrap().is_none());
    }

    #[test]
    fn test_list_records() {

        let s = new_storage();
        s.add_note("test", "data").unwrap();

        assert!(s.list_records().unwrap().len() == 1);
    }
}
