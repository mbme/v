const getDB = require('./db')
const { validators, validate } = require('./validators')

const actions = {
  LIST_RECORDS: async ({ type }) => {
    validate(
      validators.record.type(type)
    )
    return db => db.listRecords(type)
  },

  CREATE_RECORD: async ({ type, name, data }) => {
    validate(
      validators.record.type(type),
      validators.record.name(name),
      validators.record.data(data)
    )
    return db => db.createRecord(type, name, data)
  },

  UPDATE_RECORD: async ({ id, type, name, data }) => {
    validate(
      validators.record.id(id),
      validators.record.type(type),
      validators.record.name(name),
      validators.record.data(data)
    )
    return db => db.updateRecord(id, type, name, data)
  },

  DELETE_RECORD: async ({ id }) => {
    validate(
      validators.record.id(id)
    )
    return db => db.deleteRecord(id)
  },

  CREATE_FILE: async ({ record_id, name, data }) => {
    validate(
      validators.record.id(record_id),
      validators.file.name(name),
      validators.file.data(data)
    )
    return db => db.createFile(record_id, name, data)
  },

  READ_FILE: async ({ record_id, name }) => {
    validate(
      validators.record.id(record_id),
      validators.file.name(name)
    )
    return db => db.readFile(record_id, name)
  },

  DELETE_FILE: async ({ record_id, name }) => {
    validate(
      validators.record.id(record_id),
      validators.file.name(name)
    )
    return db => db.deleteFile(record_id, name)
  },
}

module.exports = async function createProcessor() {
  const db = await getDB()

  return {
    async processAction({ name, data }) {
      const action = actions[name]
      if (!action) {
        return {
          error: `unknown action: ${name}`,
        }
      }

      try {
        return await action(data)
      } catch(error) {
        console.error(`action ${name} processing error:`, error)
        return { error }
      }
    },

    close() {
      return db.close()
    },
  }
}
