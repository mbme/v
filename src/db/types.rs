use storage::types::Id;
use ::error::{Result, Error};

use std::fmt;
use std::str;
use time::Timespec;

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

impl str::FromStr for RecordProp {
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
