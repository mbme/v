use storage::types::{Blob, Id, RecordType, Record, FileInfo};
use error::{Result, Error, into_err};

use time::{self, Timespec};
use rusqlite::{Statement, Transaction, MappedRows, Row};

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
            return Err(Error::from_str("too many results"));
        }
    }

    Ok(result)
}

#[derive(Debug)]
pub enum RecordProp {
    Data,
}

impl ::std::fmt::Display for RecordProp {
    fn fmt(&self, fmt: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
        let result = match *self {
            RecordProp::Data => "data",
        };

        write!(fmt, "{}", result)
    }
}

impl ::std::str::FromStr for RecordProp {
    type Err = Error;

    fn from_str(s: &str) -> Result<RecordProp> {
        match s {
            "data" => Ok(RecordProp::Data),
            _ => Err(Error::from_str(format!("unknown record property {}", s))),
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

    pub fn add_record(&self, name: &str, record_type: RecordType) -> Result<Id> {
        self.tx.execute(
            "INSERT INTO records (name, type, create_ts, update_ts) VALUES ($1, $2, $3, $3)",
            &[&name, &record_type.to_string(), &now()]
        ).map(
            |_| self.tx.last_insert_rowid() as Id
        ).map_err(into_err)
    }

    pub fn update_record(&self, id: Id, name: &str) -> Result<bool> {
        let rows_count = self.tx.execute(
            "UPDATE records SET name = $1, update_ts = $2 WHERE id = $3",
            &[&name, &now(), &(id as i64)]
        )?;

        Ok(rows_count > 0)
    }

    pub fn add_record_props(&self, id: Id, props: &[(RecordProp, &str)]) -> Result<()> {
        let mut stmt = self.prepare_stmt(
            "INSERT INTO props (record_id, prop, data) VALUES ($1, $2, $3)"
        )?;

        for pair in props {
            let result = stmt.execute(&[&(id as i64), &pair.0.to_string(), &pair.1]);

            if let Err(err) = result {
                return Err(into_err(err));
            }
        }

        Ok(())
    }

    pub fn remove_record_props(&self, id: Id) -> Result<()> {
        self.tx.execute(
            "DELETE FROM props WHERE record_id = $1", &[&(id as i64)]
        )?;

        Ok(())
    }

    pub fn get_record(&self, id: Id) -> Result<Option<Record>> {
        let mut stmt = self.prepare_stmt(
            "SELECT type, name, create_ts, update_ts FROM records WHERE id = $1"
        )?;

        let rows = stmt.query_map(
            &[&(id as i64)],
            |row| {
                let record_type: String = row.get(0);
                let name: String = row.get(1);
                let create_ts: Timespec = row.get(2);
                let update_ts: Timespec = row.get(3);

                Record {
                    id: id,
                    name: name,
                    record_type: record_type.parse().expect("Unknown record type"),
                    create_ts: create_ts,
                    update_ts: update_ts,
                }
            }
        )?;

        get_single_result(rows)
    }

    pub fn record_exists(&self, id: Id) -> Result<bool> {
        self.get_record(id).map(|result| result.is_some())
    }

    pub fn list_records(&self, record_type: RecordType) -> Result<Vec<Record>> {
        let mut stmt = self.prepare_stmt(
            "SELECT id, name, create_ts, update_ts FROM records WHERE type = $1"
        )?;

        let results = stmt.query_map(&[&record_type.to_string()], |row| {
            let id: i64 = row.get(0);
            let name: String = row.get(1);
            let create_ts: Timespec = row.get(2);
            let update_ts: Timespec = row.get(3);

            Record {
                id: id as Id,
                name: name,
                record_type: record_type,
                create_ts: create_ts,
                update_ts: update_ts,
            }
        })?;

        let mut records = Vec::new();
        for result in results {
            records.push(result?);
        }

        Ok(records)
    }

    pub fn get_record_prop(&self, id: Id, prop: RecordProp) -> Result<Option<String>> {
        let mut stmt = self.prepare_stmt(
            "SELECT data FROM props WHERE record_id = $1 AND prop = $2"
        )?;

        let rows = stmt.query_map(
            &[&(id as i64), &prop.to_string()],
            |row| row.get::<i32, String>(0)
        )?;

        get_single_result(rows)
    }

    pub fn remove_record(&self, id: Id) -> Result<bool> {
        let rows_count = self.tx.execute(
            "DELETE FROM records WHERE id = $1", &[&(id as i64)]
        )?;

        Ok(rows_count > 0)
    }

    pub fn add_file(&self, record_id: Id, name: &str, data: &Blob) -> Result<FileInfo> {
        let create_ts = now();
        self.tx.execute(
            "INSERT INTO files (record_id, name, data, size, create_ts) VALUES ($1, $2, $3, $4, $5)",
            &[&(record_id as i64), &name, &data.0, &(data.size() as i64), &create_ts]
        )
            .map(|_| FileInfo {
                name: name.into(),
                size: data.size(),
                create_ts: create_ts,
            }) // return nothing
            .map_err(into_err)
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
            "SELECT data FROM files WHERE record_id = $1 AND name = $2"
        )?;

        let rows = stmt.query_map(
            &[&(record_id as i64), &name],
            |row| Blob(row.get::<i32, Vec<u8>>(0))
        )?;

        get_single_result(rows)
    }

    pub fn get_record_files(&self, record_id: Id) -> Result<Vec<FileInfo>> {
        let mut stmt = self.prepare_stmt(
            "SELECT name, size, create_ts FROM files WHERE record_id = $1",
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
}
