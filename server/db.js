import Database from 'better-sqlite3'
import path from 'path'
import { unixTs } from 'shared/utils'
import { readText } from 'server/utils'

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
      return db.prepare('SELECT id, type, name, data, updatedTs FROM records WHERE type = ?').all(type)
    },

    createRecord(type, name, data) {
      const ts = unixTs()
      return db.prepare('INSERT INTO records(type, name, data, createdTs, updatedTs) VALUES (?, ?, ?, ?, ?)').run(type, name, data, ts, ts).lastInsertROWID
    },

    readRecord(id) {
      return db.prepare('SELECT id, type, name, data, updatedTs FROM records WHERE id = ?').get(id)
    },

    updateRecord(id, name, data) {
      const ts = unixTs()
      return db.prepare('UPDATE records set name = ?, data = ?, updatedTs = ? WHERE id = ?').run(name, data, ts, id).changes === 1
    },

    deleteRecord(id) {
      return db.prepare('DELETE FROM records WHERE id = ?').run(id).changes === 1
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

    // --------------- KVS

    get(namespace, key) {
      const result = db.prepare('SELECT namespace, key, value FROM kvs WHERE namespace = ? AND key = ?').get(namespace, key)
      return result ? result.value : null
    },

    set(namespace, key, value) {
      this.inTransaction(() => {
        const { changes } = db.prepare('UPDATE kvs set value = ? WHERE namespace = ? AND key = ?').run(value.toString(), namespace, key)
        if (!changes) {
          db.prepare('INSERT INTO kvs(namespace, key, value) VALUES(?, ?, ?)').run(namespace, key, value.toString())
        }
      })
    },

    remove(namespace, key) {
      return db.prepare('DELETE FROM kvs WHERE namespace = ? AND key = ?').run(namespace, key).changes === 1
    },

    close() {
      db.close()
    },
  }
}

export default async function getDB(file, memory) {
  const db = new Database(file, { memory })
  db.exec(await readText(path.join(__dirname, 'db.sql')))

  return dbAPI(db)
}
