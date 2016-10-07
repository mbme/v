use storage::types::*;
use utils::convert_all_into;

#[derive(Debug, Serialize)]
pub struct ErrorDTO {
    pub error: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteDTO {
    pub name: String,
    pub data: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNoteDTO {
    pub name: String,
    pub data: String,
}

#[derive(Debug, Serialize)]
pub struct RecordDTO {
    pub id: Id,
    pub name: String,
    pub create_ts: i64,
    pub update_ts: i64,
}

#[derive(Debug, Serialize)]
pub struct FileInfoDTO {
    pub name: String,
    pub size: usize,
    pub create_ts: i64,
}

#[derive(Debug, Serialize)]
pub struct NoteDTO {
    pub id: Id,
    pub name: String,
    pub create_ts: i64,
    pub update_ts: i64,
    pub data: String,
    pub files: Vec<FileInfoDTO>,
}

impl From<Record> for RecordDTO {
    fn from (rec: Record) -> RecordDTO {
        RecordDTO {
            id: rec.id,
            name: rec.name,
            create_ts: rec.create_ts.sec,
            update_ts: rec.update_ts.sec,
        }
    }
}

impl From<FileInfo> for FileInfoDTO {
    fn from (file_info: FileInfo) -> FileInfoDTO {
        FileInfoDTO {
            name: file_info.name,
            size: file_info.size,
            create_ts: file_info.create_ts.sec,
        }
    }
}

impl From<Note> for NoteDTO {
    fn from (note: Note) -> NoteDTO {
        NoteDTO {
            id: note.record.id,
            name: note.record.name,
            create_ts: note.record.create_ts.sec,
            update_ts: note.record.update_ts.sec,
            data: note.data,
            files: convert_all_into(note.files),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectDTO {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize)]
pub struct ProjectDTO {
    pub id: Id,
    pub name: String,
    pub create_ts: i64,
    pub update_ts: i64,
    pub description: String,
    pub files: Vec<FileInfoDTO>,
}

impl From<Project> for ProjectDTO {
    fn from (note: Project) -> ProjectDTO {
        ProjectDTO {
            id: note.record.id,
            name: note.record.name,
            create_ts: note.record.create_ts.sec,
            update_ts: note.record.update_ts.sec,
            description: note.description,
            files: convert_all_into(note.files),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectDTO {
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize)]
pub struct TodoDTO {
    pub id: Id,
    pub name: String,
    pub create_ts: i64,
    pub update_ts: i64,
    pub project_id: Id,
    pub details: String,
    pub state: String,
    pub start_ts: Option<i64>,
    pub end_ts: Option<i64>,
    pub files: Vec<FileInfoDTO>,
}

impl From<Todo> for TodoDTO {
    fn from (todo: Todo) -> TodoDTO {
        TodoDTO {
            id: todo.record.id,
            name: todo.record.name,
            create_ts: todo.record.create_ts.sec,
            update_ts: todo.record.update_ts.sec,
            project_id: todo.project_id,
            details: todo.details,
            state: todo.state.to_string(),
            start_ts: todo.start_ts.map(|ts| ts.sec),
            end_ts: todo.end_ts.map(|ts| ts.sec),
            files: convert_all_into(todo.files),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateTodoDTO {
    pub name: String,
    pub details: String,
    pub start_ts: Option<i64>,
    pub end_ts: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodoDTO {
    pub name: String,
    pub details: String,
    pub state: String,
    pub start_ts: Option<i64>,
    pub end_ts: Option<i64>,
}
