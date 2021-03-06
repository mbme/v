use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use std::fmt::Display;
use serde_json;

use error::{Result};

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub server_address: String,
    pub db_file: String,
}

fn read_file_to_string<P: AsRef<Path>>(path: P) -> Result<String> {
    let mut file = File::open(path)?;

    let mut s = String::new();
    file.read_to_string(&mut s)?;

    Ok(s)
}

impl Config {
    pub fn read<P: AsRef<Path> + Display>(path: P) -> Result<Config> {
        println!("config file: {}", &path);
        let s = read_file_to_string(path)?;

        let config: Config = serde_json::from_str(&s)?;

        Ok(config)
    }
}
