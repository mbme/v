mod logger;
mod dto;
mod multipart;
mod utils;
mod notes_handlers;
mod project_handlers;
mod static_handlers;
mod files_handlers;
mod todo_handlers;

use std::sync::Arc;
use std::fs;

use iron::prelude::*;
use router::Router;

use storage::Storage;
use config::Config;

use self::logger::Logger;
use self::notes_handlers::*;
use self::static_handlers::*;
use self::files_handlers::*;
use self::project_handlers::*;
use self::todo_handlers::*;

pub const UI_APP_VERSION: &'static str = include_str!("../../../web-build/VERSION");

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

    // PROJECTS
    router.get("/api/projects", ListProjectsHandler(storage.clone()), "get project records");
    router.post("/api/projects", AddProjectHandler(storage.clone()), "add project");
    router.put("/api/projects/:id", UpdateProjectHandler(storage.clone()), "update project");
    router.get("/api/projects/:id", GetProjectHandler(storage.clone()), "get project");

    // TODOS
    router.get("/api/todos/project/:project_id", ListProjectTodosHandler(storage.clone()), "get project todos");
    router.post("/api/todos/project/:project_id", AddProjectTodoHandler(storage.clone()), "add project todo");
    router.put("/api/todos/:id", UpdateProjectTodoHandler(storage.clone()), "update project todo");
    router.get("/api/todos/:id", GetProjectTodoHandler(storage.clone()), "get project todo");

    // FILES
    router.get("/api/files/:id", ListFilesHandler(storage.clone()), "list files");
    router.post("/api/files/:id", AddFileHandler(storage.clone()), "add file");
    router.get("/api/files/:id/:name", GetFileHandler(storage.clone()), "get file");
    router.delete("/api/files/:id/:name", RemoveFileHandler(storage.clone()), "delete file");

    // Serve static files
    router.get("/", StaticIndexHandler, "static index handler");
    router.get("/*", StaticFilesHandler::new(), "static files handler");

    println!("running server on {}", &config.server_address);

    let mut chain = Chain::new(router);

    chain.link_before(Logger);
    chain.link_after(Logger);

    Iron::new(chain).http(&config.server_address as &str).expect("failed to run server");
}
