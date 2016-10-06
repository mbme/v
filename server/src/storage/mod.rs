pub mod types;
pub mod db;

use std::sync::Mutex;

use rusqlite::Connection;
use time::Timespec;

use error::{Result, into_err};
use storage::types::*;

use storage::db::DB;

pub struct Storage {
    conn: Mutex<Connection>,
}

impl Storage {
    pub fn new(path: &str) -> Result<Storage> {
        let conn = Connection::open(path).map_err(into_err)?;

        Ok(Storage { conn: Mutex::new(conn) })
    }

    fn in_tx<F, T>(&self, f: F) -> Result<T>
        where F: FnOnce(DB) -> Result<T> {
        let mut conn = self.conn.lock().expect("failed to get connection lock");
        let tx = conn.transaction()?;

        let result = f(DB::new(&tx));

        tx.commit()?;

        result
    }

    pub fn init(&self) -> Result<()> {
        let conn = self.conn.lock().expect("failed to get connection lock");

        let db = DB::new(&conn);
        db.init_schema()?;
        db.enable_foreign_keys_support()?;

        Ok(())
    }

    pub fn record_exists(&self, id: Id, record_type: RecordType) -> Result<bool> {
        self.in_tx(|db| db.record_exists(id, Some(record_type)))
    }

    pub fn list_record_files(&self, id: Id) -> Result<Vec<FileInfo>> {
        self.in_tx(|db| db.list_record_files(id))
    }

    pub fn list_note_records(&self) -> Result<Vec<Record>> {
        self.in_tx(|db| db.list_note_records())
    }

    pub fn add_note(&self, name: &str, data: &str) -> Result<Id> {
        self.in_tx(|db| db.add_note(name, data))
    }

    pub fn get_note(&self, id: Id) -> Result<Option<Note>> {
        self.in_tx(|db| db.get_note(id))
    }

    pub fn update_note(&self, id: Id, name: &str, data: &str) -> Result<bool> {
        self.in_tx(|db| db.update_note(id, name, data))
    }

    pub fn remove_note(&self, id: Id) -> Result<bool> {
        self.in_tx(|db| db.remove_note(id))
    }

    pub fn add_file(&self, record_id: Id, name: &str, data: &Blob) -> Result<FileInfo> {
        self.in_tx(|db| db.add_file(record_id, name, data))
    }

    pub fn get_file(&self, record_id: Id, name: &str) -> Result<Option<Blob>> {
        self.in_tx(|db| db.get_file(record_id, name))
    }

    pub fn remove_file(&self, record_id: Id, name: &str) -> Result<bool> {
        self.in_tx(|db| db.remove_file(record_id, name))
    }

    pub fn list_project_records(&self) -> Result<Vec<Record>> {
        self.in_tx(|db| db.list_project_records())
    }

    pub fn add_project(&self, name: &str, description: &str) -> Result<Id> {
        self.in_tx(|db| db.add_project(name, description))
    }

    pub fn get_project(&self, id: Id) -> Result<Option<Project>> {
        self.in_tx(|db| db.get_project(id))
    }

    pub fn update_project(&self, id: Id, name: &str, description: &str) -> Result<bool> {
        self.in_tx(|db| db.update_project(id, name, description))
    }

    pub fn list_todos(&self, project: &Project) -> Result<Vec<Todo>> {
        self.in_tx(|db| db.list_todos(project))
    }

    pub fn add_todo(&self,
                    project: &Project,
                    name: &str,
                    details: &str,
                    start_ts: Option<Timespec>,
                    end_ts: Option<Timespec>) -> Result<Id> {
        self.in_tx(|db| db.add_todo(project, name, details, start_ts, end_ts))
    }

    pub fn update_todo(&self,
                       id: Id,
                       name: &str,
                       details: &str,
                       state: TodoState,
                       start_ts: Option<Timespec>,
                       end_ts: Option<Timespec>) -> Result<bool> {
        self.in_tx(|db| db.update_todo(id, name, details, state, start_ts, end_ts))
    }
}

#[cfg(test)]
mod viter {
    use storage::Storage;
    use storage::types::*;
    use time::Timespec;

    fn new_storage() -> Storage {
        let storage = Storage::new(":memory:").expect("failed to open db");
        storage.init().expect("failed to init DB");
        storage
    }

    fn new_blob(data: &str) -> Blob {
        Blob(data.as_bytes().to_vec())
    }

    fn create_project(s: &Storage) -> Project {
        let id = s.add_project("name", "description").unwrap();

        s.get_project(id).unwrap().unwrap()
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
    fn test_get_unknown_note() {
        let s = new_storage();
        assert!(s.get_note(1).unwrap().is_none());
    }

    #[test]
    fn test_update_note() {
        let s = new_storage();
        let data = "data";
        let id = s.add_note("test", data).unwrap();

        let new_name = "test1";
        assert!(s.update_note(id, new_name, data).unwrap());

        let note = s.get_note(id).unwrap().unwrap();
        assert_eq!(note.record.name, new_name);
        assert_eq!(note.data, data);
    }

    #[test]
    fn test_update_unknown_note() {
        let s = new_storage();
        assert!(!s.update_note(1, "test", "test").unwrap());
    }

    #[test]
    fn test_remove_note() {
        let s = new_storage();

        let id = s.add_note("test", "data").unwrap();
        assert!(s.get_note(id).unwrap().is_some());

        assert!(s.remove_note(id).unwrap());

        assert!(s.get_note(id).unwrap().is_none());
    }

    #[test]
    fn test_remove_unknown_note() {
        let s = new_storage();
        assert!(!s.remove_note(1).unwrap());
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
    fn test_add_file_to_unknown_record() {
        let s = new_storage();
        let blob = new_blob("test");
        assert!(s.add_file(1, "test", &blob).is_err());
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
    fn test_remove_note_with_file() {
        let s = new_storage();
        let id = s.add_note("test", "data").unwrap();

        let blob = new_blob("test");
        let name = "test";
        assert!(s.add_file(id, name, &blob).is_ok());

        assert!(s.remove_note(id).unwrap());

        assert!(s.get_file(id, name).unwrap().is_none());
    }

    #[test]
    fn test_list_note_records() {
        let s = new_storage();
        s.add_note("test", "data").unwrap();

        assert!(s.list_note_records().unwrap().len() == 1);
    }

    #[test]
    fn test_add_project() {
        let s = new_storage();

        assert!(s.add_project("test", "data").is_ok());
    }

    #[test]
    fn test_get_project() {
        let s = new_storage();
        let name = "test";
        let description = "description";
        let id = s.add_project(name, description).unwrap();

        let project = s.get_project(id).unwrap().unwrap();
        assert_eq!(project.record.name, name);
        assert_eq!(project.description, description);
    }

    #[test]
    fn test_get_unknown_project() {
        let s = new_storage();
        let id = s.add_note("test", "data").unwrap();

        assert!(s.get_project(id).unwrap().is_none());
    }

    #[test]
    fn test_update_project() {
        let s = new_storage();
        let name = "test";
        let id = s.add_project(name, "test").unwrap();

        let description = "description";
        assert!(s.update_project(id, name, description).unwrap());

        let project = s.get_project(id).unwrap().unwrap();
        assert_eq!(project.record.name, name);
        assert_eq!(project.description, description);
    }

    #[test]
    fn test_update_unknown_project() {
        let s = new_storage();
        assert!(!s.update_project(1, "name", "description").unwrap());
    }

    #[test]
    fn test_list_project_records() {
        let s = new_storage();
        s.add_project("test", "data").unwrap();

        assert!(s.list_project_records().unwrap().len() == 1);
    }

    #[test]
    fn test_add_todo() {
        let s = new_storage();
        let project = create_project(&s);

        assert!(s.add_todo(&project, "name", "", None, None).is_ok());
    }

    #[test]
    fn test_add_todo_to_unknown_project() {
        let s = new_storage();
        let project = create_project(&s);

        // check with empty store
        let s = new_storage();

        assert!(s.get_project(project.record.id).unwrap().is_none());
        assert!(s.add_todo(&project, "name", "", None, None).is_err());
    }

    #[test]
    fn test_list_todos() {
        let s = new_storage();
        let project = create_project(&s);

        s.add_todo(&project, "name", "", None, None).unwrap();

        assert_eq!(s.list_todos(&project).unwrap().len(), 1);
    }

    #[test]
    fn test_list_todos_in_unknown_project() {
        let s = new_storage();
        let project = create_project(&s);

        let s = new_storage();

        assert_eq!(s.list_todos(&project).unwrap().len(), 0);
    }

    #[test]
    fn test_update_todo() {
        let s = new_storage();
        let project = create_project(&s);

        let details = "details";
        let id = s.add_todo(&project, "name", details, None, None).unwrap();

        let new_name = "test1";
        let new_end_ts = Some(Timespec::new(11, 0)); // nsec must be 0
        let new_state = TodoState::InProgress;
        assert!(s.update_todo(id, new_name, details, new_state, None, new_end_ts).unwrap());

        let todo = s.list_todos(&project).unwrap()
            .into_iter().find(|todo| todo.record.id == id);

        assert!(todo.is_some());

        let todo = todo.unwrap();

        assert_eq!(todo.record.name, new_name);
        assert_eq!(todo.details, details);
        assert_eq!(todo.state, new_state);
        assert_eq!(todo.end_ts, new_end_ts);
    }

    #[test]
    fn test_update_unknown_todo() {
        let s = new_storage();

        assert!(!s.update_todo(99, "", "", TodoState::InProgress, None, None).unwrap());
    }

    #[test]
    fn test_record_exists() {
        let s = new_storage();

        let project_id = s.add_project("test", "data").unwrap();
        let note_id = s.add_note("test", "data").unwrap();

        let project = create_project(&s);
        let todo_id = s.add_todo(&project, "name", "", None, None).unwrap();

        assert!(s.record_exists(project_id, RecordType::Project).unwrap());
        assert!(s.record_exists(note_id, RecordType::Note).unwrap());
        assert!(s.record_exists(todo_id, RecordType::Todo).unwrap());
    }

    #[test]
    fn test_unknown_record_exists() {
        let s = new_storage();

        assert!(!s.record_exists(1, RecordType::Project).unwrap());
        assert!(!s.record_exists(1, RecordType::Note).unwrap());
        assert!(!s.record_exists(1, RecordType::Todo).unwrap());
    }

    #[test]
    fn test_list_record_files() {
        let s = new_storage();

        let id = s.add_note("test", "data").unwrap();
        let blob = new_blob("test");
        let name = "test";

        assert_eq!(s.list_record_files(id).unwrap().len(), 0);

        s.add_file(id, name, &blob).unwrap();

        assert_eq!(s.list_record_files(id).unwrap().len(), 1);
    }

    #[test]
    fn test_list_unknown_record_files() {
        let s = new_storage();

        assert_eq!(s.list_record_files(1).unwrap().len(), 0);
    }
}
