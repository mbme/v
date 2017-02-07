use std::str;

use time::{self, Timespec};
use rusqlite::{Connection, MappedRows, Row, Error as SQLiteError};

use storage::types::*;
use error::{Result, Error, into_err};

fn now() -> Timespec {
    time::now().to_timespec()
}

fn get_single_result<T, F> (rows: MappedRows<F>) -> Result<Option<T>>
    where F: FnMut(&Row) -> T {
    let mut result = None;
    for row in rows {
        if result.is_none() {
            result = Some(row?);
        } else {
            return Error::err_from_str("too many results");
        }
    }

    Ok(result)
}

fn extract_results<T, R> (rows: R) -> Result<Vec<T>>
    where R: Iterator<Item=::std::result::Result<T, SQLiteError>> {
    let mut results = Vec::new();

    for row in rows {
        results.push(row?);
    }

    Ok(results)
}

pub struct DB<'a> {
    conn: &'a Connection,
}

impl<'a> DB<'a> {
    pub fn new(conn: &'a Connection) -> DB<'a> {
        DB { conn: conn }
    }

    pub fn init_schema(&self) -> Result<()> {
        self.conn.execute_batch(include_str!("init-db.sql")).map_err(into_err)
    }

    pub fn enable_foreign_keys_support(&self) -> Result<()> {
        self.conn.execute_batch("PRAGMA foreign_keys = ON;").map_err(into_err)
    }

    fn add_record(&self, record_type: RecordType, name: &str) -> Result<Id> {
        self.conn.execute(
            "INSERT INTO records (name, type, create_ts, update_ts) VALUES ($1, $2, $3, $3)",
            &[&name, &record_type.to_string(), &now()]
        ).map(
            |_| self.conn.last_insert_rowid() as Id
        ).map_err(into_err)
    }

    fn update_record(&self, id: Id, record_type: RecordType, name: &str) -> Result<bool> {
        let rows_count = self.conn.execute(
            "UPDATE records SET name = $1, update_ts = $2 WHERE id = $3 AND type = $4",
            &[&name, &now(), &(id as i64), &record_type.to_string()]
        )?;

        Ok(rows_count > 0)
    }

    fn get_record(&self, id: Id, record_type: RecordType) -> Result<Option<Record>> {
        let mut stmt = self.conn.prepare(
            "SELECT name, create_ts, update_ts FROM records WHERE id = $1 AND type = $2"
        )?;

        let rows = stmt.query_map(
            &[&(id as i64), &record_type.to_string()], |row| {
                Record {
                    id: id,
                    name: row.get(0),
                    create_ts: row.get(1),
                    update_ts: row.get(2),
                }
            }
        )?;

        get_single_result(rows)
    }

    pub fn record_exists(&self, id: Id, record_type: Option<RecordType>) -> Result<bool> {
        let mut stmt = self.conn.prepare(
            "SELECT 1 FROM records WHERE id = $1 AND (($2 IS NULL) OR (type = $2))"
        )?;

        stmt.exists(
            &[&(id as i64), &record_type.map(|t| t.to_string())]
        ).map_err(into_err)
    }

    fn remove_record(&self, id: Id, record_type: RecordType) -> Result<bool> {
        let rows_count = self.conn.execute(
            "DELETE FROM records WHERE id = $1 AND type = $2",
            &[&(id as i64), &record_type.to_string()]
        )?;

        Ok(rows_count > 0)
    }

    fn list_records(&self, record_type: RecordType) -> Result<Vec<Record>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, create_ts, update_ts FROM records WHERE type = $1 ORDER BY id"
        )?;

        let results = stmt.query_map(&[&record_type.to_string()], |row| {
            let id: i64 = row.get(0);

            Record {
                id: id as Id,
                name: row.get(1),
                create_ts: row.get(2),
                update_ts: row.get(3),
            }
        })?;

        extract_results(results)
    }

    pub fn add_file(&self, record_id: Id, name: &str, data: &Blob) -> Result<FileInfo> {
        if !self.record_exists(record_id, None)? {
            return Error::err_from_str(format!("record {} doesn't exists", record_id));
        }

        let create_ts = now();
        self.conn.execute(
            "INSERT INTO files (record_id, name, data, size, create_ts) VALUES ($1, $2, $3, $4, $5)",
            &[&(record_id as i64), &name, &data.0, &(data.size() as i64), &create_ts]
        )?;

        Ok(FileInfo {
            name: name.into(),
            size: data.size(),
            create_ts: create_ts,
        })
    }

    pub fn remove_file(&self, record_id: Id, name: &str) -> Result<bool> {
        let rows_count = self.conn.execute(
            "DELETE FROM files WHERE record_id = $1 AND name = $2",
            &[&(record_id as i64), &name]
        )?;

        Ok(rows_count > 0)
    }

    pub fn get_file(&self, record_id: Id, name: &str) -> Result<Option<Blob>> {
        let mut stmt = self.conn.prepare(
            "SELECT data FROM files WHERE record_id = $1 AND name = $2 ORDER BY name"
        )?;

        let rows = stmt.query_map(
            &[&(record_id as i64), &name],
            |row| Blob(row.get::<i32, Vec<u8>>(0))
        )?;

        get_single_result(rows)
    }

    pub fn list_record_files(&self, record_id: Id) -> Result<Vec<FileInfo>> {
        let mut stmt = self.conn.prepare(
            "SELECT name, size, create_ts FROM files WHERE record_id = $1 ORDER BY name",
        )?;

        let results = stmt.query_map(&[&(record_id as i64)], |row| {
            let name: String = row.get(0);
            let size: i64 = row.get(1);
            let create_ts: Timespec = row.get(2);

            FileInfo {
                name: name,
                size: size as usize,
                create_ts: create_ts,
            }
        })?;

        extract_results(results)
    }

    pub fn remove_record_files(&self, record_id: Id) -> Result<()> {
        self.conn.execute(
            "DELETE FROM files WHERE record_id = $1",
            &[&(record_id as i64)]
        )?;

        Ok(())
    }

    pub fn list_project_records(&self) -> Result<Vec<Record>> {
        self.list_records(RecordType::Project)
    }

    pub fn add_project(&self, name: &str, description: &str) -> Result<Id> {
        let id = self.add_record(RecordType::Project, name)?;

        self.conn.execute(
            "INSERT INTO projects (record_id, description) VALUES ($1, $2)",
            &[&(id as i64), &description]
        )?;

        Ok(id)
    }

    pub fn get_project(&self, id: Id) -> Result<Option<Project>> {
        let record = match self.get_record(id, RecordType::Project)? {
            Some(record) => record,
            None => return Ok(None),
        };

        let files = self.list_record_files(id)?;

        let mut stmt = self.conn.prepare(
            "SELECT description FROM projects WHERE record_id = $1"
        )?;

        let rows = stmt.query_map(&[&(id as i64)], |row| row.get(0))?;
        let description = match get_single_result(rows)? {
            Some(description) => description,
            None => unreachable!(),
        };

        Ok(Some(Project {
            record: record,
            files: files,
            description: description,
        }))
    }

    pub fn update_project(&self, id: Id, name: &str, description: &str) -> Result<bool> {
        if !self.update_record(id, RecordType::Project, name)? {
            return Ok(false);
        }

        let rows_count = self.conn.execute(
            "UPDATE projects SET description = $1 WHERE record_id = $2",
            &[&description, &(id as i64)]
        )?;

        if rows_count == 0 {
            unreachable!();
        }

        Ok(true)
    }

    pub fn add_note(&self, name: &str, data: &str) -> Result<Id> {
        let id = self.add_record(RecordType::Note, name)?;

        self.conn.execute(
            "INSERT INTO notes (record_id, data) VALUES ($1, $2)",
            &[&(id as i64), &data]
        )?;

        Ok(id)
    }

    pub fn get_note(&self, id: Id) -> Result<Option<Note>> {
        let record = match self.get_record(id, RecordType::Note)? {
            Some(record) => record,
            None => return Ok(None),
        };

        let files = self.list_record_files(id)?;

        let mut stmt = self.conn.prepare(
            "SELECT data FROM notes WHERE record_id = $1"
        )?;

        let rows = stmt.query_map(&[&(id as i64)], |row| row.get(0))?;
        let data = match get_single_result(rows)? {
            Some(data) => data,
            None => unreachable!(),
        };

        Ok(Some(Note {
            record: record,
            files: files,
            data: data,
        }))
    }

    pub fn update_note(&self, id: Id, name: &str, data: &str) -> Result<bool> {
        if !self.update_record(id, RecordType::Note, name)? {
            return Ok(false);
        }

        let rows_count = self.conn.execute(
            "UPDATE notes SET data = $1 WHERE record_id = $2",
            &[&data, &(id as i64)]
        )?;

        if rows_count == 0 {
            unreachable!();
        }

        Ok(true)
    }

    pub fn remove_note(&self, id: Id) -> Result<bool> {
        if !self.remove_record(id, RecordType::Note)? {
            return Ok(false);
        }

        let rows_count = self.conn.execute(
            "DELETE FROM notes WHERE record_id = $1",
            &[&(id as i64)]
        )?;

        if rows_count == 0 {
            unreachable!();
        }

        self.remove_record_files(id)?;

        Ok(true)
    }

    pub fn list_note_records(&self) -> Result<Vec<Record>> {
        self.list_records(RecordType::Note)
    }

    pub fn list_todos(&self, project: &Project) -> Result<Vec<Todo>> {
        let mut stmt = self.conn.prepare("
                SELECT id, name, create_ts, update_ts, details, state, start_ts, end_ts
                FROM todos INNER JOIN records ON todos.record_id = records.id
                WHERE project_id = $1
                ORDER BY id
        ")?;

        let mut rows = stmt.query(&[&(project.record.id as i64)])?;
        let mut todos = Vec::new();

        while let Some(row_result) = rows.next() {
            let row = row_result?;

            let id: i64 = row.get(0);
            let state_str: String = row.get(5);
            let state = state_str.parse()?;

            // TODO performance?
            let files = self.list_record_files(id as Id)?;

            todos.push(Todo {
                project_id: project.record.id,
                record: Record {
                    id: id as Id,
                    name: row.get(1),
                    create_ts: row.get(2),
                    update_ts: row.get(3),
                },
                details: row.get(4),
                state: state,
                start_ts: row.get(6),
                end_ts: row.get(7),
                files: files,
            });
        };

        Ok(todos)
    }

    pub fn add_todo(&self,
                    project: &Project,
                    name: &str,
                    details: &str,
                    start_ts: Option<Timespec>,
                    end_ts: Option<Timespec>) -> Result<Id> {
        let id = self.add_record(RecordType::Todo, name)?;

        self.conn.execute(
            "INSERT INTO todos (record_id, project_id, details, state, start_ts, end_ts) VALUES ($1, $2, $3, $4, $5, $6)",
            &[&(id as i64), &(project.record.id as i64), &details, &TodoState::Todo.to_string(), &start_ts, &end_ts]
        )?;

        Ok(id)
    }

    pub fn update_todo(&self,
                       id: Id,
                       name: &str,
                       details: &str,
                       state: TodoState,
                       start_ts: Option<Timespec>,
                       end_ts: Option<Timespec>) -> Result<bool> {

        if !self.update_record(id, RecordType::Todo, name)? {
            return Ok(false);
        }

        let rows_count = self.conn.execute(
            "UPDATE todos SET details = $1, state = $2, start_ts = $3, end_ts = $4 WHERE record_id = $5",
            &[&details, &state.to_string(), &start_ts, &end_ts, &(id as i64)]
        )?;

        if rows_count == 0 {
            unreachable!();
        }

        Ok(true)
    }

    pub fn get_todo(&self, id: Id) -> Result<Option<Todo>> {
        let record = match self.get_record(id, RecordType::Todo)? {
            Some(record) => record,
            None => return Ok(None),
        };

        let files = self.list_record_files(id)?;

        let mut stmt = self.conn.prepare(
            "SELECT project_id, details, state, start_ts, end_ts FROM todos WHERE record_id = $1"
        )?;

        let rows = stmt.query_map(&[&(id as i64)], move |row| {
            let project_id: i64 = row.get(0);
            let details: String = row.get(1);
            let state: String = row.get(2);
            let start_ts: Option<Timespec> = row.get(3);
            let end_ts: Option<Timespec> = row.get(4);

            (project_id as Id, details, state, start_ts, end_ts)
        })?;

        match get_single_result(rows)? {
            Some((project_id, details, state_str, start_ts, end_ts)) => {
                let state: TodoState = state_str.parse()?;

                Ok(Some(
                    Todo {
                        record: record,
                        files: files,
                        project_id: project_id,
                        details: details,
                        state: state,
                        start_ts: start_ts,
                        end_ts: end_ts,
                    }
                ))
            },
            None => Ok(None)
        }
    }
}
