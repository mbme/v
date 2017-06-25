/* eslint-disable camelcase */

const sqlite3 = require('sqlite3')

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
      record_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      data BLOB NOT NULL,

      CONSTRAINT unique_name UNIQUE (record_id, name),
      CONSTRAINT File_fk_record_id FOREIGN KEY(record_id) REFERENCES records(id) ON DELETE CASCADE
  );
`

function expectSingleChange ({ changes }) {
  if (changes !== 1) {
    throw new Error(`Expected single change, but there were ${changes} changes`)
  }
}

function dbAPI (db) {
  function run (sql, args) {
    return new Promise((resolve, reject) => {
      db.run(sql, args, err => err ? reject(err) : resolve(this))
    })
  }

  function get (sql, args) {
    return new Promise((resolve, reject) => {
      db.get(sql, args, (err, row) => err ? reject(err) : resolve(row))
    })
  }

  function prepare (sql, args) {
    return new Promise((resolve, reject) => {
      const statement = db.prepare(sql, args, err => err ? reject(err) : resolve(statement))
    })
  }

  function statementGet (stmt) {
    return new Promise(
      (resolve, reject) => stmt.get([], (err, row) => err ? reject(err) : resolve(row))
    )
  }

  async function selectAll (query, args, cb) {
    const stmt = await prepare(query, args)

    let row = await statementGet(stmt)
    while (row) {
      cb(row)
      row = await statementGet(stmt) // eslint-disable-line no-await-in-loop
    }
  }

  return {
    async listRecords (type) {
      const files = await this.listFiles()

      const results = []
      await selectAll('SELECT id, type, name, data FROM records WHERE type = ?', [type], (row) => {
        results.push({
          ...row,
          files: files[row.id] || [],
        })
      })

      return results
    },

    createRecord (type, name, data) {
      return run('INSERT INTO records(type, name, data) VALUES (?, ?, ?)', [type, name, data]).then(ctx => ctx.lastID)
    },

    readRecord (id) {
      return get('SELECT id, type, name, data FROM records WHERE id = ?', [id])
    },

    updateRecord (id, type, name, data) {
      return run('UPDATE records set name = ?, data = ? WHERE id = ? AND type = ?', [name, data, id, type]).then(expectSingleChange)
    },

    deleteRecord (id) {
      return run('DELETE FROM records where id = ?', [id]).then(expectSingleChange)
    },

    // ----------- FILES ----------------------------------

    /**
     * @returns {[record_id]: [...fileInfo]}
     */
    async listFiles () {
      const result = {}
      await selectAll('SELECT record_id, name, length(data) AS size FROM files', [], (row) => {
        const files = result[row.record_id] || []
        files.push(row)

        result[row.record_id] = files
      })

      return result
    },

    /**
     * @param {Buffer} data
     */
    createFile (record_id, name, data) {
      return run('INSERT INTO files(record_id, name, data) VALUES (?, ?, ?)', [record_id, name, data])
    },

    readFile (record_id, name) {
      return get('SELECT data FROM files WHERE record_id = ? AND name = ?', [record_id, name]).then(file => file ? file.data : file)
    },

    deleteFile (record_id, name) {
      return run('DELETE FROM files where record_id = ? AND name = ?', [record_id, name]).then(expectSingleChange)
    },

    close () {
      return new Promise((resolve, reject) => {
        db.close(err => err ? reject(err) : resolve())
      })
    },
  }
}

module.exports = function getDB (file = ':memory:') {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(file, err => err ? reject(err) : resolve(db))
  })
    .then(db => new Promise((resolve, reject) => db.exec(SQL_INIT_DB, err => err ? reject(err) : resolve(db))))
    .then(dbAPI)
}
