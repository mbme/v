import { validateAndThrow } from 'server/validators'
import createStorage from 'server/storage'

const actions = {
  'PING': () => 'PONG',

  'LIST_RECORDS': (storage, { type }) => {
    validateAndThrow(
      [ type, 'Record.type' ],
    )

    return storage.listRecords(type)
  },

  'CREATE_RECORD': (storage, { type, name, data }, files) => {
    validateAndThrow(
      [ type, 'Record.type' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
      [ files, 'File[]' ],
    )

    return storage.createRecord(type, name, data, files)
  },

  'UPDATE_RECORD': (storage, { id, name, data }, files) => {
    validateAndThrow(
      [ id, 'Record.id' ],
      [ name, 'Record.name' ],
      [ data, 'Record.data' ],
      [ files, 'File[]' ],
    )

    return storage.updateRecord(id, name, data, files)
  },

  'DELETE_RECORD': (storage, { id }) => {
    validateAndThrow(
      [ id, 'Record.id' ],
    )

    return storage.deleteRecord(id)
  },

  'READ_FILE': (storage, { id }) => {
    validateAndThrow(
      [ id, 'file-id' ],
    )

    return storage.readFile(id)
  },
}

export default async function createProcessor({ rootDir }) {
  console.log('root dir: ', rootDir)
  const storage = await createStorage(rootDir)

  return {
    processAction({ action: { name, data }, files = [] }) {
      const action = actions[name]
      if (!action) throw new Error(`unknown action: ${name}`)

      return action(storage, data, files)
    },

    close() {
      return storage.close()
    },
  }
}
