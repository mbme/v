import { validateAndThrow } from 'shared/validators'
import { selectFileLinks, parse } from 'shared/parser'
import { uniq } from 'shared/utils'
import { sha256 } from './utils'
import getDB from './db'

const extractFileIds = data => uniq(selectFileLinks(parse(data)))

async function getNewFiles(db, ids, files) {
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
  await Promise.all(ids.map(async (id) => {
    if (await db.isKnownFile(id)) {
      return
    }

    const file = newFiles[id]
    if (!file) {
      throw new Error(`Can't attach file with unknown id ${id}`)
    }

    filesToAdd.push({ id, name: file.name, data: file.data })
  }))

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

  CREATE_RECORD: async (db, { type, name, data }, files) => {
    validateAndThrow(
      [ type, 'Record.type' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
      [ files, 'File[]' ],
    )

    const fileIds = extractFileIds(data)
    const filesToAdd = await getNewFiles(db, fileIds, files)

    return db.inTransaction(async () => {
      await db.addFiles(filesToAdd)

      const id = await db.createRecord(type, name, data)

      await db.addConnections(id, fileIds)

      return id
    })
  },

  UPDATE_RECORD: async (db, { id, name, data }, files) => {
    validateAndThrow(
      [ id, 'Record.id' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
      [ files, 'File[]' ],
    )

    const fileIds = extractFileIds(data)
    const filesToAdd = await getNewFiles(db, fileIds, files)

    return db.inTransaction(async () => {
      await db.updateRecord(id, name, data)

      await db.addFiles(filesToAdd)
      await db.removeConnections(id)
      await db.addConnections(id, fileIds)
      await db.removeUnusedFiles()
    })
  },

  DELETE_RECORD: (db, { id }) => {
    validateAndThrow(
      [ id, 'Record.id' ],
    )

    return db.inTransaction(async () => {
      await db.deleteRecord(id)
      await db.removeConnections(id)
      await db.removeUnusedFiles()
    })
  },

  READ_FILE: (db, { id }) => {
    validateAndThrow(
      [ id, 'file-id' ],
    )

    return db.readFile(id)
  },
}

export default async function createProcessor() {
  const db = await getDB()

  return {
    async processAction({ name, data, files = [] }) {
      const action = actions[name]
      if (!action) {
        throw new Error(`unknown action: ${name}`)
      }

      try {
        return await action(db, data, files)
      } catch (e) {
        console.error(`action ${name} processing error:`, e)
        throw e
      }
    },

    close() {
      return db.close()
    },
  }
}
