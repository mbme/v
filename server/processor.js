import { extractFileIds, parse } from 'shared/parser'
import { validateAndThrow } from 'server/validators'
import { sha256, aesDecrypt, existsFile } from 'server/utils'
import createStorage from 'server/storage'

const actions = {
  PING: () => 'PONG',

  LIST_RECORDS: (db, { type }) => {
    validateAndThrow(
      [ type, 'Record.type' ],
    )

    return db.listRecords(type)
  },

  CREATE_RECORD: (db, { type, name, data }, files) => {
    validateAndThrow(
      [ type, 'Record.type' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
      [ files, 'File[]' ],
    )

    const fileIds = extractFileIds(parse(data))
    const filesToAdd = getNewFiles(db, fileIds, files)

    return db.inTransaction(() => {
      db.addFiles(filesToAdd)

      const id = db.createRecord(type, name, data)

      db.addConnections(id, fileIds)

      return id
    })
  },

  UPDATE_RECORD: (db, { id, name, data }, files) => {
    validateAndThrow(
      [ id, 'Record.id' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
      [ files, 'File[]' ],
    )

    const fileIds = extractFileIds(parse(data))
    const filesToAdd = getNewFiles(db, fileIds, files)

    return db.inTransaction(() => {
      if (!db.updateRecord(id, name, data)) throw new Error(`Record ${id} doesn't exist`)

      db.addFiles(filesToAdd)
      db.removeConnections(id)
      db.addConnections(id, fileIds)
      db.removeUnusedFiles()
    })
  },

  DELETE_RECORD: (db, { id }) => {
    validateAndThrow(
      [ id, 'Record.id' ],
    )

    return db.inTransaction(() => {
      if (!db.deleteRecord(id)) throw new Error(`Record ${id} doesn't exist`)

      db.removeUnusedFiles()
    })
  },

  READ_FILE: (db, { id }) => {
    validateAndThrow(
      [ id, 'file-id' ],
    )

    return db.readFile(id)
  },
}

export default async function createProcessor({ dbFile, inMemDb, password }) {
  const dbFileExists = await existsFile(dbFile)

  const storage = await createStorage(dbFile)

  if (!dbFileExists) db.set('security', 'password', sha256(password))

  return {
    processAction({ action: { name, data }, files = [] }) {
      const action = actions[name]
      if (!action) throw new Error(`unknown action: ${name}`)

      return action(db, data, files)
    },

    // token: AES("valid <generation timestamp>", SHA256(password))
    isValidAuth(token) {
      try {
        return /^valid \d+$/.test(aesDecrypt(token, db.get('security', 'password')))
      } catch (ignored) {
        return false
      }
    },

    close() {
      db.close()
    },
  }
}
