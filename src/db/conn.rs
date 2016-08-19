use std::sync::{Mutex, MutexGuard};
use ::error::Result;

use rusqlite::Connection;

pub trait ConnectionProvider: Sync + Send {
    fn get_connection(&self) -> &Mutex<Connection>;

    fn conn(&self) -> MutexGuard<Connection> {
        self.get_connection().lock().unwrap()
    }
}

pub struct InMemConnProvider {
    conn: Mutex<Connection>,
}

impl InMemConnProvider {
    pub fn new() -> Result<Box<ConnectionProvider>> {
        let conn = Connection::open_in_memory()?;

        let provider = InMemConnProvider { conn: Mutex::new(conn) };

        Ok(Box::new(provider))
    }
}

impl ConnectionProvider for InMemConnProvider {
    fn get_connection(&self) -> &Mutex<Connection> {
        &self.conn
    }
}

#[cfg(test)]
mod test {
    use super::InMemConnProvider;

    #[test]
    fn test_mem_db() {
        assert!(InMemConnProvider::new().is_ok());
    }
}
