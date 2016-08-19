pub mod conn;
pub mod db;
pub mod types;

pub use self::conn::ConnectionProvider;
pub use self::db::DBUtils;
pub use self::types::RecordProp;

pub fn in_mem_provider() -> Box<ConnectionProvider> {
    let provider = conn::InMemConnProvider::new().unwrap();

    provider.conn().init_schema().unwrap();

    provider
}
