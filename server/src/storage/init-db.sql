CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    create_ts INTEGER NOT NULL,
    update_ts INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS props (
    record_id INTEGER NOT NULL,
    prop TEXT NOT NULL,
    data TEXT,
    FOREIGN KEY(record_id) REFERENCES records(id)
);

CREATE TABLE IF NOT EXISTS files (
    record_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    data BLOB NOT NULL,
    size INTEGER NOT NULL,
    create_ts INTEGER NOT NULL,

    CONSTRAINT unique_name UNIQUE (record_id, name),
    FOREIGN KEY(record_id) REFERENCES records(id)
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    create_ts INTEGER NOT NULL,
    update_ts INTEGER NOT NULL
);
