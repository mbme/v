use std::fmt;
use std::error::Error as StdError;
use std::io::Error as IOError;
use rusqlite::Error as SQLiteErr;
use serde_json::Error as JSONError;

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

    pub fn err_from<T>(err: Box<SafeError>) -> Result<T> {
        Err(Error::from(err))
    }

    pub fn from_str<S>(desc: S) -> Self
        where S: Into<String> {
        Error {
            source: None,
            description: desc.into(),
        }
    }

    pub fn err_from_str<T, S>(desc: S) -> Result<T>
        where S: Into<String> {
        Err(Error::from_str(desc))
    }
}

pub fn into_err<T: StdError + Send + Sync + 'static>(err: T) -> Error {
    Error::from(Box::new(err))
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
        Error::from(Box::new(err))
    }
}

impl From<IOError> for Error {
    fn from(err: IOError) -> Error {
        Error::from(Box::new(err))
    }
}

impl From<JSONError> for Error {
    fn from(err: JSONError) -> Error {
        Error::from(Box::new(err))
    }
}
