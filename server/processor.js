const getDB = require('./db')

const actions = {
  LIST_RECORDS: ({ type }) => {
    // TODO validate data.type
    return db => db.listRecords(type)
  },

  CREATE_RECORD: ({ type, name, data }) => {
    // validate everything
    return db => db.createRecord(type, name, data)
  },

  UPDATE_RECORD: ({ id, type, name, data }) => {
    // validate
    return db => db.updateRecord(id, type, name, data)
  },

  DELETE_RECORD: ({ id }) => {
    // validate
    return db => db.deleteRecord(id)
  },

  CREATE_FILE: ({ record_id, name, data }) => {
    // validate
    return db => db.createFile(record_id, name, data)
  },

  READ_FILE: ({ record_id, name }) => {
    // validate
    return db => db.readFile(record_id, name)
  },

  DELETE_FILE: ({ record_id, name }) => {
    // validate
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
