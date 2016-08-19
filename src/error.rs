use std::fmt;
use std::error::Error as StdError;
use rusqlite::Error as SQLiteErr;

pub type SafeError = StdError + Send + Sync;

#[derive(Debug)]
pub struct Error {
    source: Option<Box<SafeError>>,
    description: String,
}

impl Error {
    pub fn new<S>(err: Box<SafeError>, desc: S) -> Self
        where S: Into<String> {
        Error {
            source: Some(err),
            description: desc.into(),
        }
    }

    pub fn from(err: Box<SafeError>) -> Self {
        Error::new(err, "")
    }

    pub fn from_str<S>(desc: S) -> Self
        where S: Into<String> {
        Error {
            source: None,
            description: desc.into(),
        }
    }
}

pub fn into_err<T: StdError + Send + Sync + 'static>(err: T) -> Error {
    Error::from(box err)
}

pub type Result<T> = ::std::result::Result<T, Error>;

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}: {:?}", self.description, self.source)
    }
}

impl StdError for Error {
    fn description(&self) -> &str {
        &self.description
    }
}

impl From<SQLiteErr> for Error {
    fn from(err: SQLiteErr) -> Error {
        Error::from(box err)
    }
}
