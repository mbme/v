import { validateAndThrow } from 'shared/validators'
import getDB from './db'

const actions = {
  LIST_RECORDS: ({ type }) => {
    validateAndThrow(
      [ type, 'Record.type' ],
    )

    return db => db.listRecords(type)
  },

  CREATE_RECORD: ({ type, name, data }) => {
    validateAndThrow(
      [ type, 'Record.type' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
    )

    return db => db.createRecord(type, name, data)
  },

  UPDATE_RECORD: ({ id, name, data }) => {
    validateAndThrow(
      [ id, 'Record.id' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
    )

    return db => db.updateRecord(id, name, data)
  },

  DELETE_RECORD: ({ id }) => {
    validateAndThrow(
      [ id, 'Record.id' ],
    )

    return db => db.deleteRecord(id)
  },

  CREATE_FILE: ({ recordId, name, data }) => {
    validateAndThrow(
      [ recordId, 'Record.id' ],
      [ name, 'File.name' ],
      [ data, 'File.data' ],
    )

    return db => db.createFile(recordId, name, data).then(() => {})
  },

  READ_FILE: ({ recordId, name }) => {
    validateAndThrow(
      [ recordId, 'Record.id' ],
      [ name, 'File.name' ],
    )

    return db => db.readFile(recordId, name)
  },

  DELETE_FILE: ({ recordId, name }) => {
    validateAndThrow(
      [ recordId, 'Record.id' ],
      [ name, 'File.name' ],
    )

    return db => db.deleteFile(recordId, name).then(() => {})
  },
}

export default async function createProcessor() {
  const db = await getDB()

  return {
    async processAction({ name, data }) {
      const action = actions[name]
      if (!action) {
        throw new Error(`unknown action: ${name}`)
      }

      try {
        return await action(data)(db)
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
