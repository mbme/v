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
    pub record_type: RecordType,
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
            record_type: rec.record_type,
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
