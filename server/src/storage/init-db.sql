-- DEFERRABLE INITIALLY DEFERRED checks foreign keys integrity only when transaction finished

CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'note', 'todo'
    create_ts INTEGER NOT NULL,
    update_ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    record_id INTEGER PRIMARY KEY,
    description TEXT,

    FOREIGN KEY(record_id) REFERENCES records(id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS notes (
    record_id INTEGER PRIMARY KEY,
    data TEXT,

    FOREIGN KEY(record_id) REFERENCES records(id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS todos (
    record_id INTEGER PRIMARY KEY,
    project_id INTEGER NOT NULL,
    details TEXT,
    state TEXT NOT NULL,
    start_ts INTEGER,
    end_ts INTEGER,

    FOREIGN KEY(record_id) REFERENCES records(id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY(project_id) REFERENCES projects(record_id) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS files (
    record_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    data BLOB NOT NULL,
    size INTEGER NOT NULL,
    create_ts INTEGER NOT NULL,

    CONSTRAINT unique_name UNIQUE (record_id, name),
    FOREIGN KEY(record_id) REFERENCES records(id) DEFERRABLE INITIALLY DEFERRED
);
