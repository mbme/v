import Database from 'better-sqlite3'

const SQL_INIT_DB = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA auto_vacuum = FULL;

  CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      data TEXT NOT NULL
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
`

function dbAPI(db) {
  const begin = db.prepare('BEGIN')
  const commit = db.prepare('COMMIT')
  const rollback = db.prepare('ROLLBACK')

  return {
    inTransaction(doActions) {
      if (db.inTransaction) {
        return doActions()
      }

      begin.run()

      try {
        const result = doActions()
        commit.run()

        return result
      } finally {
        if (db.inTransaction) {
          rollback.run()
        }
      }
    },

    listRecords(type) {
      return db.prepare('SELECT id, type, name, data FROM records WHERE type = ?').all(type)
    },

    createRecord(type, name, data) {
      return db.prepare('INSERT INTO records(type, name, data) VALUES (?, ?, ?)').run(type, name, data).lastInsertROWID
    },

    readRecord(id) {
      return db.prepare('SELECT id, type, name, data FROM records WHERE id = ?').get(id)
    },

    updateRecord(id, name, data) {
      return db.prepare('UPDATE records set name = ?, data = ? WHERE id = ?').run(name, data, id).changes === 1
    },

    deleteRecord(id) {
      return db.prepare('DELETE FROM records where id = ?').run(id).changes === 1
    },

    // ----------- FILES ----------------------------------

    addFiles(files) {
      const stmt = db.prepare('INSERT INTO files(id, name, data) VALUES(?, ?, ?)')

      this.inTransaction(() => {
        files.forEach(({ id, name, data }) => stmt.run(id, name, data))
      })
    },

    readFile(fileId) {
      return db.prepare('SELECT name, data FROM files WHERE id = ?').get(fileId)
    },

    isKnownFile(fileId) {
      return !!db.prepare('SELECT 1 FROM files WHERE id = ?').get(fileId)
    },

    removeUnusedFiles() {
      return db.prepare('DELETE FROM files WHERE id NOT IN (SELECT DISTINCT fileId FROM records_files)').run().changes
    },

    addConnections(recordId, fileIds) {
      const stmt = db.prepare('INSERT INTO records_files(recordId, fileId) VALUES(?, ?)')
      this.inTransaction(() => {
        fileIds.forEach(fileId => stmt.run(recordId, fileId))
      })
    },

    removeConnections(recordId) {
      return db.prepare('DELETE FROM records_files WHERE recordId = ?').run(recordId).changes
    },

    close() {
      return db.close()
    },
  }
}

export default function getDB(file = '/tmp/db', memory = true) {
  const db = new Database(file, { memory })
  db.exec(SQL_INIT_DB)

  return dbAPI(db)
}
