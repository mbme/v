#![feature(box_syntax, box_patterns, question_mark, custom_derive, plugin)]

#![plugin(serde_macros)]
#![plugin(clippy)]

extern crate time;
extern crate rusqlite;
extern crate multipart;
extern crate serde;
extern crate serde_json;
#[macro_use] extern crate iron;
extern crate router;
extern crate mime_guess;

mod storage;
mod utils;
mod server;
mod error;
mod config;

use config::Config;
use std::env;

fn main() {
    let path = env::var("V_CONFIG").unwrap_or("~/.config/v/config.json".into());

    let config = Config::read(&path).expect(&format!("Failed to load config.json from {}", &path));

    server::start_server(&config);
}
