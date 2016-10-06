mod logger;
mod dto;
mod multipart;
mod utils;
mod notes_handlers;
mod static_handlers;
mod files_handlers;

use std::sync::Arc;
use std::fs;

use iron::prelude::*;
use router::Router;

use storage::Storage;
use storage::types::RecordType;
use config::Config;

use self::logger::Logger;
use self::notes_handlers::*;
use self::static_handlers::*;
use self::files_handlers::*;

pub const UI_APP_VERSION: &'static str = include_str!("../../../web-client/prod/VERSION");

pub fn start_server(config: &Config) {

    // print DB file size
    if let Ok(metadata) = fs::metadata(&config.db_file) {
        println!("db file size: {:.3} MB", metadata.len() as f64 / 1024.0 / 1024.0);
    }

    let storage = Storage::new(&config.db_file).expect("failed to open db");

    storage.init().expect("failed to init DB");

    let storage = Arc::new(storage);

    let mut router = Router::new();

    // NOTES
    router.get("/api/notes", ListNotesHandler(storage.clone()), "get note records");
    router.post("/api/notes", AddNoteHandler(storage.clone()), "add note");
    router.put("/api/notes/:id", UpdateNoteHandler(storage.clone()), "update note");
    router.get("/api/notes/:id", GetNoteHandler(storage.clone()), "get note");
    router.delete("/api/notes/:id", DeleteNoteHandler(storage.clone()), "delete note");

    // NOTE FILES
    router.get("/api/notes/:id/files", ListFilesHandler::new(RecordType::Note, storage.clone()), "get note files");
    router.post("/api/notes/:id/files", AddFileHandler::new(RecordType::Note, storage.clone()), "add note file");
    router.get("/api/notes/:id/files/:name", GetFileHandler::new(RecordType::Note, storage.clone()), "get note file");
    router.delete("/api/notes/:id/files/:name", RemoveFileHandler::new(RecordType::Note, storage.clone()), "delete note file");

    // Serve static files
    router.get("/", StaticIndexHandler, "static index handler");
    router.get("/*", StaticFilesHandler::new(), "static files handler");

    println!("running server on {}", &config.server_address);

    let mut chain = Chain::new(router);

    chain.link_before(Logger);
    chain.link_after(Logger);

    Iron::new(chain).http(&config.server_address as &str).expect("failed to run server");
}
