use storage::types::{Blob, Categories, Category, Id};
use error::{Result, Error, into_err};

use std::collections::HashMap;
use std::fmt;

use time::{self, Timespec};
use rusqlite::{Statement, Transaction, Error as RusqliteError};

fn id_to_sql(id: Id) -> i64 {
    id as i64
}

fn now() -> Timespec {
    time::now().to_timespec()
}

#[derive(Debug)]
pub enum RecordProp {
    Data,
    Category,
}

impl fmt::Display for RecordProp {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        let result = match *self {
            RecordProp::Data => "data",
            RecordProp::Category => "category",
        };

        write!(fmt, "{}", result)
    }
}

impl ::std::str::FromStr for RecordProp {
    type Err = Error;

    fn from_str(s: &str) -> Result<RecordProp> {
        match s {
            "data" => Ok(RecordProp::Data),
            "category" => Ok(RecordProp::Category),
            _ => Err(Error::from_str(format!("unknown record property {}", s))),
        }
    }
}

pub type RecordRow = (String, Timespec, Timespec);
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

    pub fn add_record(&self, name: &str, _type: &str) -> Result<Id> {
        self.tx.execute(
            "INSERT INTO records (name, type, create_ts, update_ts) VALUES ($1, $2, $3, $3)",
            &[&name, &_type, &now()]
        ).map(
            |_| self.tx.last_insert_rowid() as Id
        ).map_err(into_err)
    }

    pub fn update_record(&self, id: Id, name: &str) -> Result<bool> {
        let rows_count = self.tx.execute(
            "UPDATE records SET name = $1, update_ts = $2 WHERE id = $3",
            &[&name, &now(), &id_to_sql(id)]
        )?;

        Ok(rows_count > 0)
    }

    pub fn add_record_props(&self, record_id: Id, props: &[(RecordProp, &str)]) -> Result<()> {
        let mut stmt = self.prepare_stmt(
            "INSERT INTO props (record_id, prop, data) VALUES ($1, $2, $3)"
        )?;

        for pair in props {
            let result = stmt.execute(&[&id_to_sql(record_id), &pair.0.to_string(), &pair.1]);

            if let Err(err) = result {
                return Err(into_err(err));
            }
        }

        Ok(())
    }

    pub fn remove_record_props(&self, id: Id) -> Result<()> {
        self.tx.execute(
            "DELETE FROM props WHERE record_id = $1", &[&id_to_sql(id)]
        )?;

        Ok(())
    }

    pub fn get_record(&self, record_id: Id, _type: &str) -> Result<Option<RecordRow>> {
        let result = self.tx.query_row(
            "SELECT name, create_ts, update_ts FROM records WHERE id = $1 AND type = $2",
            &[&id_to_sql(record_id), &_type],
            |row| {
                let name: String = row.get(0);
                let create_ts: Timespec = row.get(1);
                let update_ts: Timespec = row.get(2);
                (name, create_ts, update_ts)
            }
        );

        match result {
            Ok(rec_row) => Ok(Some(rec_row)),
            Err(RusqliteError::QueryReturnedNoRows) => Ok(None),
            Err(err) => Err(into_err(err)),
        }
    }

    pub fn get_records(&self) -> Result<Vec<FullRecordRow>> {
        let mut stmt = self.prepare_stmt(
            "SELECT id, name, create_ts, update_ts FROM records"
        )?;

        let records = stmt.query_map(&[], |row| {
            let id: i64 = row.get(0);
            let id = id as Id;
            let name: String = row.get(1);
            let create_ts: Timespec = row.get(2);
            let update_ts: Timespec = row.get(3);

            (id, name, create_ts, update_ts)
        })?;

        let records = records.collect()?;

        Ok(records)
    }

    pub fn get_records_categories(&self) -> Result<HashMap<Id, Categories>> {
        let mut stmt = self.prepare_stmt("SELECT record_id, data FROM props WHERE prop = $1")?;
        let mut rows = stmt.query(&[&RecordProp::Category.to_string()])?;

        let mut res: HashMap<Id, Categories> = HashMap::new();

        while let Some(result_row) = rows.next() {
            let row = result_row?;

            let id: i64 = row.get(0);
            let id = id as Id;

            let category = Category(row.get(1));

            if res.contains_key(&id) {
                let mut categories = res.get_mut(&id).unwrap();
                categories.insert(category);
            } else {
                let mut categories = Categories::new();
                categories.insert(category);
                res.insert(id, categories);
            }
        }

        Ok(res)
    }

    pub fn get_record_props(&self, record_id: Id, props: &[RecordProp]) -> Result<Vec<(RecordProp, String)>> {
        let props = props.iter()
            .map(|s| format!("'{}'", s))
            .collect::<Vec<_>>()
            .join(", ");

        let mut stmt = self.prepare_stmt(
            &format!("SELECT prop, data FROM props WHERE record_id = $1 AND prop IN ({})", props)
        )?;
        let mut rows = stmt.query(&[&id_to_sql(record_id)])?;

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
            "DELETE FROM records WHERE id = $1", &[&id_to_sql(id)]
        )?;

        Ok(rows_count > 0)
    }

    pub fn add_file(&self, name: &str, data: &Blob) -> Result<Id> {
        self.tx.execute("INSERT INTO files (name, data, create_ts) VALUES ($1, $2, $3)",
                          &[&name, data, &now()])
            .map(|_| self.tx.last_insert_rowid() as Id)
            .map_err(into_err)
    }

    pub fn remove_file(&self, id: Id) -> Result<bool> {
        let rows_count = self.tx.execute(
            "DELETE FROM files WHERE id = $1", &[&id_to_sql(id)]
        )?;

        Ok(rows_count > 0)
    }

    pub fn get_file(&self, id: Id) -> Result<Option<Blob>> {
        let blob = self.tx.query_row(
            "SELECT data FROM files WHERE id = $1",
            &[&id_to_sql(id)], |row| row.get(0)
        )?;

        Ok(blob)
    }
}
