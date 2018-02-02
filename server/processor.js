import { assertAll } from 'shared/types'
import createStorage from 'server/storage'

const actions = {
  'PING': () => 'PONG',

  'LIST_RECORDS': (storage, { type }) => {
    assertAll(
      [ type, 'record-type' ],
    )

    return storage.listRecords(type)
  },

  'READ_RECORD': (storage, { id }) => {
    assertAll(
      [ id, 'record-id' ],
    )

    return storage.readRecord(id)
  },

  'CREATE_RECORD': (storage, { type, name, data }, files) => {
    assertAll(
      [ type, 'record-type' ],
      [ name, 'record-name' ],
      [ data, 'record-data' ],
      [ files, 'NewFile[]' ],
    )

    return storage.createRecord(type, name, data, files)
  },

  'UPDATE_RECORD': (storage, { id, name, data }, files) => {
    assertAll(
      [ id, 'record-id' ],
      [ name, 'record-name' ],
      [ data, 'record-data' ],
      [ files, 'NewFile[]' ],
    )

    return storage.updateRecord(id, name, data, files)
  },

  'DELETE_RECORD': (storage, { id }) => {
    assertAll(
      [ id, 'record-id' ],
    )

    return storage.deleteRecord(id)
  },

  'READ_FILE': (storage, { id }) => {
    assertAll(
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
