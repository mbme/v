
export default function createStorage(path) {
  const cache = {
    records: {},
    files: {},
    byId: {},
    kvs: {},
  }

  // TODO fill cache

  return {
    checkConsistency() {
      throw new Error('NYI')
    },

    // Records

    listRecords(type) {
      return cache.records[type]
    },

    createRecord(type, name, data, newFiles) {

    },

    readRecord(id) {
      return cache.byId[id]
      // TODO return
    },

    updateRecord(id, name, data, newFiles) {

    },

    deleteRecord(id) {

    },

    readFile(fileId) {
      if (!cache.files[fileId]) {
        return null
      }
      // TODO return
    },

    // KVS

    get(namespace, key) {
      if (!cache.kvs[namespace]) return undefined
      return cache.kvs[namespace][key]
    },

    set(namespace, key, value) {
      if (!cache.kvs[namespace]) cache.kvs[namespace] = {}
      cache.kvs[namespace][key] = value

      // TODO write
    },

    remove(namespace, key) {
      if (!cache.kvs[namespace]) return

      delete cache.kvs[namespace][key]

      // TODO write
    },
  }
}
