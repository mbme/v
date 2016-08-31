use storage::types::{Blob, Id, RecordType};
use error::{Result, Error, into_err};
use std::str::FromStr;

use time::{self, Timespec};
use rusqlite::{Statement, Transaction, Error as RusqliteError};

fn now() -> Timespec {
    time::now().to_timespec()
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

pub type RecordRow = (RecordType, String, Timespec, Timespec);
pub type FullRecordRow = (Id, String, Timespec, Timespec);

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

    pub fn get_record(&self, id: Id) -> Result<Option<RecordRow>> {
        let result = self.tx.query_row(
            "SELECT type, name, create_ts, update_ts FROM records WHERE id = $1",
            &[&(id as i64)],
            |row| {
                // FIXME replace all .get() with .get_checked() and propagate errors
                let _type: String = row.get(0);
                let name: String = row.get(1);
                let create_ts: Timespec = row.get(2);
                let update_ts: Timespec = row.get(3);
                (RecordType::from_str(&_type).unwrap(), name, create_ts, update_ts)
            }
        );

        match result {
            Ok(rec_row) => Ok(Some(rec_row)),
            Err(RusqliteError::QueryReturnedNoRows) => Ok(None),
            Err(err) => Err(into_err(err)),
        }
    }

    pub fn record_exists(&self, id: Id) -> Result<bool> {
        self.get_record(id).map(|result| result.is_some())
    }

    pub fn get_records(&self) -> Result<Vec<FullRecordRow>> {
        let mut stmt = self.prepare_stmt(
            "SELECT id, name, create_ts, update_ts FROM records"
        )?;

        let results = stmt.query_map(&[], |row| {
            let id: i64 = row.get(0);
            let name: String = row.get(1);
            let create_ts: Timespec = row.get(2);
            let update_ts: Timespec = row.get(3);

            (id as Id, name, create_ts, update_ts)
        })?;

        let mut records = Vec::new();
        for result in results {
            records.push(result?);
        }

        Ok(records)
    }

    pub fn get_record_props(&self, id: Id, props: &[RecordProp]) -> Result<Vec<(RecordProp, String)>> {
        let props = props.iter()
            .map(|s| format!("'{}'", s))
            .collect::<Vec<_>>()
            .join(", ");

        let mut stmt = self.prepare_stmt(
            &format!("SELECT prop, data FROM props WHERE record_id = $1 AND prop IN ({})", props)
        )?;
        let mut rows = stmt.query(&[&(id as i64)])?;

        let mut res = vec![];
        while let Some(result_row) = rows.next() {
            let row = result_row?;

            let prop: String = row.get(0);
            let prop: RecordProp = prop.parse()?;

            let data: String = row.get(1);
            res.push((prop, data));
        }

        Ok(res)
    }

    pub fn remove_record(&self, id: Id) -> Result<bool> {
        let rows_count = self.tx.execute(
            "DELETE FROM records WHERE id = $1", &[&(id as i64)]
        )?;

        Ok(rows_count > 0)
    }

    pub fn add_file(&self, record_id: Id, name: &str, data: &Blob) -> Result<()> {
        self.tx.execute(
            "INSERT INTO files (record_id, name, data, size, create_ts) VALUES ($1, $2, $3, $4, $5)",
            &[&(record_id as i64), &name, &data.0, &(data.size() as i64), &now()]
        )
            .map(|_| ()) // return nothing
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
        let result = self.tx.query_row(
            "SELECT data FROM files WHERE record_id = $1 AND name = $2",
            &[&(record_id as i64), &name], |row| row.get::<i32, Vec<u8>>(0)
        );

        match result {
            Ok(data) => Ok(Some(Blob(data))),
            Err(RusqliteError::QueryReturnedNoRows) => Ok(None),
            Err(err) => Err(into_err(err)),
        }
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
