import sqlite3 from 'sqlite3'

const SQL_INIT_DB = `
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
      recordId INTEGER NOT NULL,
      fileId TEXT NOT NULL,
      CONSTRAINT unique_connection UNIQUE (recordId, fileId)
  );
`

function expectSingleChange({ changes }) {
  if (changes !== 1) {
    throw new Error(`Expected single change, but there were ${changes} changes`)
  }
}

function extractChanges({ changes }) {
  return changes
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

  function statementRun(stmt, args) {
    return new Promise((resolve, reject) => {
      stmt.run(args, function runCallback(err) {
        err ? reject(err) : resolve(this)
      })
    })
  }

  async function selectAll(query, args) {
    const stmt = await prepare(query, args)

    const results = []

    let row = await statementGet(stmt)
    while (row) { // TODO check performance vs Promise.all()
      results.push(row)
      row = await statementGet(stmt) // eslint-disable-line no-await-in-loop
    }

    return results
  }

  return {
    async inTransaction(actions) {
      await run('BEGIN TRANSACTION')

      return actions().then(
        async (result) => {
          await run('COMMIT TRANSACTION')
          return result
        },
        async (e) => {
          await run('ROLLBACK TRANSACTION')
          throw e
        },
      )
    },

    listRecords(type) {
      return selectAll('SELECT id, type, name, data FROM records WHERE type = ?', [ type ])
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

    listFiles() {
      return selectAll('SELECT id, name, length(data) AS size FROM files', [])
    },

    // TODO run in transaction
    async addFiles(files) {
      const stmt = await prepare('INSERT INTO files(id, name, data) VALUES(?, ?, ?)')

      await Promise.all(files.map(({ id, name, data }) => statementRun(stmt, [ id, name, data ])))
    },

    readFile(fileId) {
      return get('SELECT name, data FROM files WHERE id = ?', [ fileId ])
    },

    isKnownFile(fileId) {
      return get('SELECT 1 FROM files WHERE id = ?', [ fileId ]).then(result => !!result)
    },

    removeUnusedFiles() {
      return run('DELETE FROM files WHERE id NOT IN (SELECT DISTINCT fileId FROM records_files)').then(extractChanges)
    },

    // TODO run in transaction
    async addConnections(recordId, fileIds) {
      const stmt = await prepare('INSERT INTO records_files(recordId, fileId) VALUES(?, ?)')

      await Promise.all(fileIds.map(fileId => statementRun(stmt, [ recordId, fileId ])))
    },

    removeConnections(recordId) {
      return run('DELETE FROM records_files WHERE recordId = ?', [ recordId ]).then(extractChanges)
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
