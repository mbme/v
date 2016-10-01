use std::str;
use std::fmt;

use time::{self, Timespec};
use rusqlite::{Statement, Transaction, MappedRows, Row};

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

fn extract_results<T, F> (rows: MappedRows<F>) -> Result<Vec<T>>
    where F: FnMut(&Row) -> T {
    let mut results = Vec::new();

    for row in rows {
        results.push(row?);
    }

    Ok(results)
}

#[derive(Debug)]
enum RecordType {
    Note,
    Todo,
    Project,
}

impl fmt::Display for RecordType {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        let result = match *self {
            RecordType::Note    => "note",
            RecordType::Todo    => "todo",
            RecordType::Project => "project",
        };

        write!(fmt, "{}", result)
    }
}

impl str::FromStr for RecordType {
    type Err = Error;

    fn from_str(s: &str) -> Result<RecordType> {
        match s {
            "note"    => Ok(RecordType::Note),
            "todo"    => Ok(RecordType::Todo),
            "project" => Ok(RecordType::Project),
            _ => Error::err_from_str(format!("unknown record type {}", s)),
        }
    }
}

pub struct DB<'a> {
    tx: &'a Transaction<'a>,
}

impl<'a> DB<'a> {
    pub fn new(tx: &'a Transaction) -> DB<'a> {
        DB { tx: tx }
    }

    pub fn init_schema(&self) -> Result<()> {
        self.tx.execute_batch(include_str!("init-db.sql")).map_err(into_err)
    }

    fn prepare_stmt(&self, sql: &str) -> Result<Statement> {
        self.tx.prepare(sql).map_err(into_err)
    }

    fn add_record(&self, record_type: RecordType, name: &str) -> Result<Id> {
        self.tx.execute(
            "INSERT INTO records (name, type, create_ts, update_ts) VALUES ($1, $2, $3, $3)",
            &[&name, &record_type.to_string(), &now()]
        ).map(
            |_| self.tx.last_insert_rowid() as Id
        ).map_err(into_err)
    }

    fn update_record(&self, id: Id, record_type: RecordType, name: &str) -> Result<bool> {
        let rows_count = self.tx.execute(
            "UPDATE records SET name = $1, update_ts = $2 WHERE id = $3 AND type = $4",
            &[&name, &now(), &(id as i64), &record_type.to_string()]
        )?;

        Ok(rows_count > 0)
    }

    fn get_record(&self, id: Id, record_type: RecordType) -> Result<Option<Record>> {
        let mut stmt = self.prepare_stmt(
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

    fn record_exists(&self, id: Id) -> Result<bool> {
        self.prepare_stmt(
            "SELECT 1 FROM records WHERE id = $1"
        )?.exists(&[&(id as i64)]).map_err(into_err)
    }

    fn remove_record(&self, id: Id, record_type: RecordType) -> Result<bool> {
        let rows_count = self.tx.execute(
            "DELETE FROM records WHERE id = $1 AND type = $2",
            &[&(id as i64), &record_type.to_string()]
        )?;

        Ok(rows_count > 0)
    }

    pub fn add_file(&self, record_id: Id, name: &str, data: &Blob) -> Result<FileInfo> {
        if !self.record_exists(record_id)? {
            return Error::err_from_str(format!("record {} doesn't exists", record_id));
        }

        let create_ts = now();
        self.tx.execute(
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
        let rows_count = self.tx.execute(
            "DELETE FROM files WHERE record_id = $1 AND name = $2",
            &[&(record_id as i64), &name]
        )?;

        Ok(rows_count > 0)
    }

    pub fn get_file(&self, record_id: Id, name: &str) -> Result<Option<Blob>> {
        let mut stmt = self.prepare_stmt(
            "SELECT data FROM files WHERE record_id = $1 AND name = $2 ORDER BY name"
        )?;

        let rows = stmt.query_map(
            &[&(record_id as i64), &name],
            |row| Blob(row.get::<i32, Vec<u8>>(0))
        )?;

        get_single_result(rows)
    }

    pub fn get_record_files(&self, record_id: Id) -> Result<Vec<FileInfo>> {
        let mut stmt = self.prepare_stmt(
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

        let mut files = Vec::new();
        for result in results {
            files.push(result?);
        }

        Ok(files)
    }

    pub fn remove_record_files(&self, record_id: Id) -> Result<()> {
        self.tx.execute(
            "DELETE FROM files WHERE record_id = $1",
            &[&(record_id as i64)]
        )
            .map(|_| ()) // return nothing
            .map_err(into_err)
    }

    pub fn list_projects(&self) -> Result<Vec<Project>> {
        let mut stmt = self.prepare_stmt("
                SELECT id, name, description, create_ts, update_ts
                FROM projects INNER JOIN records ON projects.record_id = records.id
                ORDER BY id
        ")?;

        let results = stmt.query_map(&[], |row| {
            let id: i64 = row.get(0);

            Project {
                record: Record {
                    id: id as Id,
                    name: row.get(1),
                    create_ts: row.get(3),
                    update_ts: row.get(4),
                },
                description: row.get(2),
            }
        })?;

        extract_results(results)
    }

    pub fn add_project(&self, name: &str, description: &str) -> Result<Id> {
        let id = self.add_record(RecordType::Project, name)?;

        self.tx.execute(
            "INSERT INTO projects (record_id, description) VALUES ($1, $2)",
            &[&(id as i64), &description]
        )?;

        Ok(id)
    }

    pub fn update_project(&self, id: Id, name: &str, description: &str) -> Result<bool> {
        if !self.update_record(id, RecordType::Project, name)? {
            return Ok(false);
        }

        let rows_count = self.tx.execute(
            "UPDATE projects SET description = $1 WHERE id = $2",
            &[&description, &(id as i64)]
        )?;

        if rows_count == 0 {
            unreachable!();
        }

        Ok(true)
    }

    pub fn add_note(&self, name: &str, data: &str) -> Result<Id> {
        let id = self.add_record(RecordType::Note, name)?;

        self.tx.execute(
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

        let files = self.get_record_files(id)?;

        let mut stmt = self.prepare_stmt(
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

        let rows_count = self.tx.execute(
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

        let rows_count = self.tx.execute(
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
        let mut stmt = self.prepare_stmt(
            "SELECT id, name, create_ts, update_ts FROM records WHERE type = $1 ORDER BY id"
        )?;

        let results = stmt.query_map(&[&RecordType::Note.to_string()], |row| {
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
}
