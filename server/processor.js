import { validateAndThrow } from 'shared/validators'
import { selectFileLinks, parse } from 'shared/parser'
import { uniq } from 'shared/utils'
import { sha256 } from 'server/utils'
import getDB from './db'

const extractFileIds = data => uniq(selectFileLinks(parse(data)))

function getNewFiles(db, ids, files) {
  const newFiles = {}
  files.forEach((file) => {
    const id = sha256(file.data)

    if (newFiles[id]) {
      console.error(`WARN: duplicate file with id ${id}: ${file.name} & ${newFiles[id].name}`)
      return
    }

    newFiles[id] = file
  })

  const filesToAdd = []
  ids.forEach((id) => {
    if (db.isKnownFile(id)) {
      return
    }

    const file = newFiles[id]
    if (!file) {
      throw new Error(`Can't attach file with unknown id ${id}`)
    }

    filesToAdd.push({ id, name: file.name, data: file.data })
  })

  if (Object.keys(newFiles).length !== filesToAdd.length) {
    console.error('WARN: there are redundant new files')
  }

  return filesToAdd
}

const actions = {
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

    const fileIds = extractFileIds(data)
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

    const fileIds = extractFileIds(data)
    const filesToAdd = getNewFiles(db, fileIds, files)

    return db.inTransaction(() => {
      if (!db.updateRecord(id, name, data)) {
        throw new Error(`Record ${id} doesn't exist`)
      }

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
      if (!db.deleteRecord(id)) {
        throw new Error(`Record ${id} doesn't exist`)
      }
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

export default function createProcessor() {
  const db = getDB()

  return {
    processAction({ action: { name, data }, files = [] }) {
      const action = actions[name]
      if (!action) {
        throw new Error(`unknown action: ${name}`)
      }

      return action(db, data, files)
    },

    close() {
      return db.close()
    },
  }
}
