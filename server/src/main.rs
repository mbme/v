#![feature(box_syntax, box_patterns, question_mark, custom_derive, plugin)]

#![plugin(serde_macros)]
#![plugin(clippy)]

extern crate time;
extern crate rusqlite;
// extern crate multipart;
extern crate serde;
extern crate serde_json;
#[macro_use] extern crate iron;
extern crate router;

pub mod storage;
pub mod utils;
pub mod server;
pub mod error;

fn main() {
    ::server::start_server("127.0.0.1:8080");
}
