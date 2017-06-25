import getDB from './db'
import { validators, validate } from './validators'

const actions = {
  LIST_RECORDS: ({ type }) => {
    validate(
      validators.record.type(type)
    )
    return db => db.listRecords(type)
  },

  CREATE_RECORD: ({ type, name, data }) => {
    validate(
      validators.record.type(type),
      validators.record.name(name),
      validators.record.data(data)
    )
    return db => db.createRecord(type, name, data)
  },

  UPDATE_RECORD: ({ id, type, name, data }) => {
    validate(
      validators.record.id(id),
      validators.record.type(type),
      validators.record.name(name),
      validators.record.data(data)
    )
    return db => db.updateRecord(id, type, name, data)
  },

  DELETE_RECORD: ({ id }) => {
    validate(
      validators.record.id(id)
    )
    return db => db.deleteRecord(id)
  },

  CREATE_FILE: ({ record_id, name, data }) => {
    validate(
      validators.record.id(record_id),
      validators.file.name(name),
      validators.file.data(data)
    )
    return db => db.createFile(record_id, name, data).then(() => {})
  },

  READ_FILE: ({ record_id, name }) => {
    validate(
      validators.record.id(record_id),
      validators.file.name(name)
    )
    return db => db.readFile(record_id, name)
  },

  DELETE_FILE: ({ record_id, name }) => {
    validate(
      validators.record.id(record_id),
      validators.file.name(name)
    )
    return db => db.deleteFile(record_id, name).then(() => {})
  },
}

export default async function createProcessor () {
  const db = await getDB()

  return {
    async processAction ({ name, data }) {
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

    close () {
      return db.close()
    },
  }
}
