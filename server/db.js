import sqlite3 from 'sqlite3'

const SQL_INIT_DB = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      data TEXT NOT NULl
  );
  CREATE INDEX Record_ix_type ON records(type);

  CREATE TABLE IF NOT EXISTS files (
      recordId INTEGER NOT NULL,
      name TEXT NOT NULL,
      data BLOB NOT NULL,

      CONSTRAINT unique_name UNIQUE (recordId, name),
      CONSTRAINT File_fk_recordId FOREIGN KEY(recordId) REFERENCES records(id) ON DELETE CASCADE
  );
`

function expectSingleChange({ changes }) {
  if (changes !== 1) {
    throw new Error(`Expected single change, but there were ${changes} changes`)
  }
}

function dbAPI(db) {
  function run(sql, args) {
    return new Promise((resolve, reject) => {
      db.run(sql, args, function runCallback(err) {
        err ? reject(err) : resolve(this)
      })
    })
  }

  function get(sql, args) {
    return new Promise((resolve, reject) => {
      db.get(sql, args, (err, row) => err ? reject(err) : resolve(row))
    })
  }

  function prepare(sql, args) {
    return new Promise((resolve, reject) => {
      const statement = db.prepare(sql, args, err => err ? reject(err) : resolve(statement))
    })
  }

  function statementGet(stmt) {
    return new Promise(
      (resolve, reject) => stmt.get([], (err, row) => err ? reject(err) : resolve(row))
    )
  }

  async function selectAll(query, args, cb) {
    const stmt = await prepare(query, args)

    let row = await statementGet(stmt)
    while (row) {
      cb(row)
      row = await statementGet(stmt) // eslint-disable-line no-await-in-loop
    }
  }

  return {
    async listRecords(type) {
      const files = await this.listFiles()

      const results = []
      await selectAll('SELECT id, type, name, data FROM records WHERE type = ?', [ type ], (row) => {
        results.push({
          ...row,
          files: files[row.id] || [],
        })
      })

      return results
    },

    createRecord(type, name, data) {
      return run('INSERT INTO records(type, name, data) VALUES (?, ?, ?)', [ type, name, data ]).then(ctx => ctx.lastID)
    },

    readRecord(id) {
      return get('SELECT id, type, name, data FROM records WHERE id = ?', [ id ])
    },

    updateRecord(id, name, data) {
      return run('UPDATE records set name = ?, data = ? WHERE id = ?', [ name, data, id ]).then(expectSingleChange)
    },

    deleteRecord(id) {
      return run('DELETE FROM records where id = ?', [ id ]).then(expectSingleChange)
    },

    // ----------- FILES ----------------------------------

    /**
     * @returns {[recordId]: [...fileInfo]}
     */
    async listFiles() {
      const result = {}
      await selectAll('SELECT recordId, name, length(data) AS size FROM files', [], (row) => {
        const files = result[row.recordId] || []
        files.push(row)

        result[row.recordId] = files
      })

      return result
    },

    /**
     * @param {Buffer} data
     */
    createFile(recordId, name, data) {
      return run('INSERT INTO files(recordId, name, data) VALUES (?, ?, ?)', [ recordId, name, data ])
    },

    readFile(recordId, name) {
      return get('SELECT data FROM files WHERE recordId = ? AND name = ?', [ recordId, name ]).then(file => file ? file.data : file)
    },

    deleteFile(recordId, name) {
      return run('DELETE FROM files where recordId = ? AND name = ?', [ recordId, name ]).then(expectSingleChange)
    },

    close() {
      return new Promise((resolve, reject) => {
        db.close(err => err ? reject(err) : resolve())
      })
    },
  }
}

export default function getDB(file = ':memory:') {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(file, err => err ? reject(err) : resolve(db))
  })
    .then(db => new Promise((resolve, reject) => db.exec(SQL_INIT_DB, err => err ? reject(err) : resolve(db))))
    .then(dbAPI)
}
