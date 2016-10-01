pub mod types;
pub mod db;

use std::sync::Mutex;
use rusqlite::Connection;

use error::{Result, into_err};
use storage::types::*;

use storage::db::DB;

pub struct Storage {
    conn: Mutex<Connection>,
}

impl Storage {
    pub fn new(path: &str) -> Result<Storage> {
        let conn = Connection::open(path).map_err(into_err);

        Ok(Storage { conn: Mutex::new(conn?) })
    }

    fn with_db<F, T>(&self, f: F) -> Result<T> where F: FnOnce(DB) -> Result<T> {
        let mut conn = self.conn.lock().expect("failed to get connection lock");
        let tx = conn.transaction()?;

        let result = f(DB::new(&tx));

        tx.commit()?;

        result
    }


    pub fn init(&self) -> Result<()> {
        self.with_db(|db| db.init_schema())
    }

    pub fn list_note_records(&self) -> Result<Vec<Record>> {
        self.with_db(|db| db.list_note_records())
    }

    pub fn add_note(&self, name: &str, data: &str) -> Result<Id> {
        self.with_db(|db| db.add_note(name, data))
    }

    pub fn get_note(&self, id: Id) -> Result<Option<Note>> {
        self.with_db(|db| db.get_note(id))
    }

    pub fn update_note(&self, id: Id, name: &str, data: &str) -> Result<bool> {
        self.with_db(|db| db.update_note(id, name, data))
    }

    pub fn remove_note(&self, id: Id) -> Result<bool> {
        self.with_db(|db| db.remove_note(id))
    }

    pub fn add_file(&self, record_id: Id, name: &str, data: &Blob) -> Result<FileInfo> {
        self.with_db(|db| db.add_file(record_id, name, data))
    }

    pub fn get_file(&self, record_id: Id, name: &str) -> Result<Option<Blob>> {
        self.with_db(|db| db.get_file(record_id, name))
    }

    pub fn remove_file(&self, record_id: Id, name: &str) -> Result<bool> {
        self.with_db(|db| db.remove_file(record_id, name))
    }
}

#[cfg(test)]
mod viter {
    use storage::*;
    use storage::types::Blob;

    fn new_storage() -> Storage {
        let storage = Storage::new(":memory:").expect("failed to open db");
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
        let name = "test";

        let result = s.add_file(id, name, &blob);
        assert!(result.is_ok());
        let info = result.unwrap();

        assert_eq!(name, info.name);
        assert_eq!(blob.size(), info.size);
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

        assert!(s.list_note_records().unwrap().len() == 1);
    }
}
