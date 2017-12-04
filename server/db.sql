PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA auto_vacuum = FULL;

CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    createdTs INTEGER NOT NULL,
    updatedTs INTEGER NOT NULL
);
CREATE INDEX Record_ix_type ON records(type);

CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS records_files (
    recordId INTEGER NOT NULL REFERENCES records(id) ON DELETE CASCADE,
    fileId TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    CONSTRAINT unique_connection UNIQUE (recordId, fileId)
);

CREATE TABLE IF NOT EXISTS kvs (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT unique_key UNIQUE (namespace, key)
);
