/**
 * RecordType: 'note' | 'todo'
 * File: { id: string, name: string, data: blob }
 * Record: { type: RecordType, id: string, name: string, data: string }
 */
export default function createStorage(path) {
  const cache = {
    records: {}, // [Record.type]: { [Record.id]: Record }
    byId: {}, // [Record.id]: Record
    files: {}, // [File.id]: File
    kvs: {}, // [namespace]: { [key]: value }
  }

  const lock = {
    locked: false,
    queue: [],
  }

  async function unlocked() {
    if (!lockQueue) return
    await new Promise(resolve => lockQueue.push(resolve))
  }



  // TODO fill cache

  return {
    checkConsistency() {
      throw new Error('NYI')
    },

    // Records

    async listRecords(type) {
      await unlocked()

      return cache.records[type]
    },

    /**
     * @param {RecordType} type
     * @param {string} name
     * @param {string} data
     * @param {File[]} newFiles
     */
    async createRecord(type, name, data, newFiles) {
      await unlocked()

      // lock
      try {

        await Promise.all([
          writeRecord(type, name, data),
          ...newFiles.filter(file => !!cache.files[file.id]).map(writeFile), // FIXME
        ])

      } catch (e) {
        console.error(e);
        // remove redundant files
      } finally {
        // unlock
      }
    },

    readRecord(id) {
      await unlocked()

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
