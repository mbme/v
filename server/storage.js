import { extractFileIds, parse } from 'shared/parser'
import { uniq, extend } from 'shared/utils'
import { sha256 } from 'server/utils'

function prepareAttachments(attachments) {
  const files = {}

  for (const attachment of attachments) {
    files[sha256(attachment.data)] = attachment
  }

  return files
}


/**
 * RecordId: number // positive integer
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

  function writeFile(id, name, data) {

  }

  function removeFile(id) {

  }

  async function removeUnusedFiles() {
    const idsInUse = uniq(Object.values(cache.records).reduce((ids, record) => ids.push(...record.files.map(file => file.id)), []))
    const allIds = Object.keys(cache.files)

    const unusedIds = allIds.filter(fileId => !idsInUse.includes(fileId))

    await Promise.all(unusedIds.map(async (fileId) => {
      delete cache.files[fileId]
      return removeFile(fileId).catch(err => console.error(`failed to remove redundant file ${fileId}`, err))
    }))
  }

  function writeRecord(id, type, name, data) {

  }

  async function removeRecord(id) {


    await removeUnusedFiles()
  }


  async function saveRecord(id, type, name, data, attachments) {
    const prevRecord = cache.records[id]
    if (prevRecord && prevRecord.type !== type) throw new Error(`Wrong type ${prevRecord.type}, should be ${type}`)

    const fileIds = extractFileIds(parse(data))

    const newIds = fileIds.filter(fileId => !cache.files[fileId])
    if (newIds.length !== attachments.length) console.error('WARN: there are redundant new files')

    const attachedFiles = prepareAttachments(attachments)

    const unknownIds = newIds.filter(fileId => !attachedFiles[fileId])
    if (unknownIds.length) throw new Error(`Can't attach files with unknown ids: ${unknownIds}`)

    try {
      // 1. write new files
      const newFiles = await Promise.all(newIds.map(fileId => writeFile(fileId, attachedFiles[fileId].name, attachedFiles[fileId].data)))

      // 2. write new record data
      await writeRecord(id, type, name, data)

      // 3. update files cache
      for (const file of newFiles) {
        cache.files[file.id] = file
      }

      const record = { id, type, name, data, files: fileIds.map(fileId => cache.files[fileId]) }

      // 4. update records cache
      cache.records[id] = record

      // 5. remove unused files if needed
      if (prevRecord) await removeUnusedFiles()

      return record
    } catch (e) {
      console.error('failed to save record', e)

      // remove leftover files
      await Promise.all(newIds.map(removeFile)).catch(err => console.error('cleanup failed', err))

      throw e
    }
  }

  // TODO fill cache

  return {
    // Records

    listRecords(type) {
      return queue(async () => Object.values(cache.records).filter(record => record.type === type))
    },

    readRecord(id) {
      return queue(() => cache.records[id])
    },

    /**
     * @param {RecordType} type
     * @param {string} name
     * @param {string} data
     * @param {NewFile[]} attachments
     */
    createRecord(type, name, data, attachments) {
      return queue(async () => {
        const id = Math.max(0, ...Object.keys(cache.records)) + 1

        return saveRecord(id, type, name, data, attachments)
      })
    },

    /**
     * @param {RecordId} id
     * @param {string} name
     * @param {string} data
     * @param {NewFile[]} attachments
     */
    updateRecord(id, name, data, attachments) {
      return queue(() => {
        const record = cache.records[id]
        if (!record) throw new Error(`Record ${id} doesn't exist`)

        return saveRecord(id, record.type, name, data, attachments)
      })
    },

    deleteRecord(id) {
      return queue(() => {
        if (!cache.records[id]) throw new Error(`Record ${id} doesn't exist`)

        return removeRecord(id)
      })
    },

    readFile(fileId) {
      return queue(() => {
        if (!cache.files[fileId]) return null

        // TODO read file
      })
    },

    // KVS

    get(namespace, key) {
      return queue(() => {
        if (!cache.kvs[namespace]) return undefined

        return cache.kvs[namespace][key]
      })
    },

    set(namespace, key, value) {
      return queue(async () => {
        const kvs = extend(cache.kvs, {
          [namespace]: {
            ...cache.kvs[namespace],
            [key]: value,
          },
        })

        await writeKvs(kvs)

        // update cache
        cache.kvs = kvs
      })
    },

    remove(namespace, key) {
      return this.set(namespace, key, undefined)
    },

    close() {
      return new Promise((resolve) => { closeCb = resolve })
    },
  }
}
