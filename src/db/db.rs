use storage::types::{Blob, Categories, Category, Id};
use ::error::{Result, into_err};

use super::types::{FullRecordRow, RecordProp, RecordRow};

use std::collections::HashMap;

use time;
use rusqlite::{Connection, Statement, Error as RusqliteError};

fn id_to_sql(id: Id) -> i64 {
    id as i64
}

pub trait DBUtils {
    fn init_schema(&self) -> Result<()>;
    fn prepare_stmt(&self, sql: &str) -> Result<Statement>;

    fn add_record(&self, name: &str, _type: &str) -> Result<Id>;
    fn update_record(&self, id: Id, name: &str) -> Result<bool>;
    fn add_record_props(&self, record_id: Id, props: &[(RecordProp, &str)]) -> Result<()>;
    fn remove_record_props(&self, id: Id) -> Result<()>;
    fn get_record(&self, record_id: Id, _type: &str) -> Result<Option<RecordRow>>;
    fn get_records(&self) -> Result<Vec<FullRecordRow>>;
    fn get_records_categories(&self) -> Result<HashMap<Id, Categories>>;
    fn get_record_props(&self,
                        record_id: Id,
                        props: &[RecordProp])
                        -> Result<Vec<(RecordProp, String)>>;
    fn remove_record(&self, id: Id) -> Result<bool>;
    fn add_file(&self, name: &str, data: &Blob) -> Result<Id>;
    fn remove_file(&self, id: Id) -> Result<bool>;
    fn get_file(&self, id: Id) -> Result<Option<Blob>>;
}

impl DBUtils for Connection {
    fn init_schema(&self) -> Result<()> {
        self.execute_batch("
            BEGIN;

            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                create_ts INTEGER NOT NULL,
                update_ts INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS props (
                record_id INTEGER NOT NULL,
                prop TEXT NOT NULL,
                data TEXT,
                FOREIGN KEY(record_id) REFERENCES records(id)
            );

            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                data BLOB NOT NULL,
                create_ts INTEGER NOT NULL
            );

            COMMIT;
        ").map_err(into_err)
    }

    fn prepare_stmt(&self, sql: &str) -> Result<Statement> {
        self.prepare(sql).map_err(into_err)
    }

    fn add_record(&self, name: &str, _type: &str) -> Result<Id> {
        self.execute(
            "INSERT INTO records (name, type, create_ts, update_ts) VALUES ($1, $2, $3, $3)",
            &[&name, &_type, &time::now().to_timespec()]
        ).map(
            |_| self.last_insert_rowid() as Id
        ).map_err(into_err)
    }

    fn update_record(&self, id: Id, name: &str) -> Result<bool> {
        let rows_count = self.execute(
            "UPDATE records SET name = $1, update_ts = $2 WHERE id = $3",
            &[&name, &time::now().to_timespec(), &id_to_sql(id)]
        )?;

        Ok(rows_count > 0)
    }

    fn add_record_props(&self, record_id: Id, props: &[(RecordProp, &str)]) -> Result<()> {
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

    fn remove_record_props(&self, id: Id) -> Result<()> {
        self.execute(
            "DELETE FROM props WHERE record_id = $1", &[&id_to_sql(id)]
        )?;

        Ok(())
    }

    fn get_record(&self, record_id: Id, _type: &str) -> Result<Option<RecordRow>> {
        let result = self.query_row(
            "SELECT name, create_ts, update_ts FROM records WHERE id = $1 AND type = $2",
            &[&id_to_sql(record_id), &_type],
            |row| {
                let name: String = row.get(0);
                let create_ts: time::Timespec = row.get(1);
                let update_ts: time::Timespec = row.get(2);
                (name, create_ts, update_ts)
            }
        );

        match result {
            Ok(rec_row) => Ok(Some(rec_row)),
            Err(RusqliteError::QueryReturnedNoRows) => Ok(None),
            Err(err) => Err(into_err(err)),
        }
    }

    fn get_records(&self) -> Result<Vec<FullRecordRow>> {
        let mut stmt = self.prepare_stmt(
            "SELECT id, name, create_ts, update_ts FROM records"
        )?;

        let records = stmt.query_map(&[], |row| {
            let id: i64 = row.get(0);
            let id = id as Id;
            let name: String = row.get(1);
            let create_ts: time::Timespec = row.get(2);
            let update_ts: time::Timespec = row.get(3);

            (id, name, create_ts, update_ts)
        })?;

        let records = records.collect()?;

        Ok(records)
    }

    fn get_records_categories(&self) -> Result<HashMap<Id, Categories>> {
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

    fn get_record_props(&self, record_id: Id, props: &[RecordProp]) -> Result<Vec<(RecordProp, String)>> {
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

    fn remove_record(&self, id: Id) -> Result<bool> {
        let rows_count = self.execute(
            "DELETE FROM records WHERE id = $1", &[&id_to_sql(id)]
        )?;

        Ok(rows_count > 0)
    }

    fn add_file(&self, name: &str, data: &Blob) -> Result<Id> {
        self.execute("INSERT INTO files (name, data, create_ts) VALUES ($1, $2, $3)",
                     &[&name, data, &time::now().to_timespec()])
            .map(|_| self.last_insert_rowid() as Id)
            .map_err(into_err)
    }

    fn remove_file(&self, id: Id) -> Result<bool> {
        let rows_count = self.execute(
            "DELETE FROM files WHERE id = $1", &[&id_to_sql(id)]
        )?;

        Ok(rows_count > 0)
    }

    fn get_file(&self, id: Id) -> Result<Option<Blob>> {
        let blob = self.query_row(
            "SELECT data FROM files WHERE id = $1",
            &[&id_to_sql(id)], |row| row.get(0)
        )?;

        Ok(blob)
    }
}
