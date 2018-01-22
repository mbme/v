import { extractFileIds, parse } from 'shared/parser'
import { sha256 } from 'server/utils'

/**
 * RecordType: 'note' | 'todo'
 * Record: { type: RecordType, id: string, name: string, data: string, files: File[] }
 * File: { id: string, name: string }
 * NewFile: { name: string, data: Buffer }
 */
export default function createStorage(path) {
  const cache = {
    records: {}, // [Record.type]: { [Record.id]: Record }
    files: {}, // [File.id]: File
    kvs: {}, // [namespace]: { [key]: value }
  }

  let immediateId = null
  let closeCb
  const _queue = []

  async function processQueue() {
    while (_queue.length) {
      const action = _queue.shift()
      await action().catch(e => console.error('queued action failed', e)) // eslint-disable-line no-await-in-loop
    }
    immediateId = null
    if (closeCb) closeCb()
  }

  function queue(action) {
    return new Promise((resolve, reject) => {
      if (closeCb) throw new Error('closing storage')

      _queue.push(() => action().then(resolve, reject))
      if (!immediateId) immediateId = setImmediate(processQueue)
    })
  }

  function writeRecord(type, name, data) {

  }

  function writeFile(id, name, data) {

  }

  function removeFile(id) {

  }

  // TODO fill cache

  return {
    checkConsistency() {
      throw new Error('NYI')
    },

    // Records

    // atomic
    listRecords(type) {
      return queue(async () => Object.values(cache.records).filter(record => record.type === type))
    },

    /**
     * @param {RecordType} type
     * @param {string} name
     * @param {string} data
     * @param {NewFile[]} attachments
     */
    createRecord(type, name, data, attachments) {
      return queue(async () => {
        const newFiles = {}
        attachments.forEach((attachment) => {
          newFiles[sha256(attachment.data)] = attachment
        })

        const newIds = extractFileIds(parse(data)).filter(id => !cache.files[id])

        const unknownIds = newIds.filter(id => !newFiles[id])
        if (unknownIds.length) throw new Error(`Can't attach files with unknown ids: ${unknownIds}`)

        if (newIds.length !== attachments.length) {
          console.error('WARN: there are redundant new files')
        }

        try {
          const files = await Promise.all(newIds.map(id => writeFile(id, newFiles[id].name, newFiles[id].data)))

          const id = await writeRecord(type, name, data)

          // update cache
          const record = { id, type, name, data, files }
          cache.records[id] = record
          files.forEach((file) => {
            cache.files[file.id] = file
          })

          return id
        } catch (e) {
          console.error(e)

          // remove leftover files
          await Promise.all(newIds.map(removeFile))

          throw e
        }
      })
    },

    readRecord(id) {
      return queue(() => cache.records[id])
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

    close() {
      return new Promise(resolve => closeCb = resolve)
    },
  }
}
