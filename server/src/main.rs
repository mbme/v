#![feature(box_syntax, box_patterns, question_mark, plugin, rustc_macro)]

#![plugin(clippy)]

extern crate time;
extern crate rusqlite;
extern crate multipart;
extern crate serde;
extern crate serde_json;
#[macro_use] extern crate serde_derive;
#[macro_use] extern crate iron;
extern crate router;
extern crate mime_guess;
extern crate url;

mod storage;
mod utils;
mod server;
mod error;
mod config;

use config::Config;
use std::env;

fn main() {
    let version = option_env!("GIT_COMMIT_HASH").unwrap_or("");

    assert_eq!(version, server::UI_APP_VERSION, "Server version doesn't match client version");

    let path = env::var("V_CONFIG").unwrap_or("~/.config/v/config.json".into());

    let config = Config::read(&path).expect("Failed to load config file");

    server::start_server(&config);
}
