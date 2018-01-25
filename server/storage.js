import path from 'path'
import { extractFileIds, parse } from 'shared/parser'
import { uniq, extend } from 'shared/utils'
import * as utils from 'server/utils'

function createStorageFs(baseDir) {
  const filesBaseDir = path.join(baseDir, 'files')

  async function atomicWriteText(file, data) {
    await utils.writeText(`${file}.atomic-temp`, data)
    return utils.renameFile(`${file}.atomic-temp`, file)
  }

  return {
    async writeAttachment(id, name, data) {
      const file = path.join(filesBaseDir, `${id}_${name}`)
      if (utils.existsFile(file)) throw new Error(`Attachment ${file} already exists`)

      await utils.writeFile(file, data)
    },

    async removeAttachment(id, name) {
      try {
        await utils.deleteFile(path.join(baseDir, 'files', `${id}_${name}`))
      } catch (e) {
        console.error(`failed to remove attachment file ${id}`, e)
      }
    },

    async readAttachment(id, name) {
      return utils.readFile(path.join(baseDir, 'files', `${id}_${name}`))
    },

    async writeRecord(id, type, name, data) {
      await atomicWriteText(path.join(baseDir, type, `${id}_${name}.mb`), data)
    },

    async removeRecord(id, type, name) {
      await utils.deleteFile(path.join(baseDir, type, `${id}_${name}.mb`))
    },

    async writeKvs(kvs) {
      await atomicWriteText(path.join(baseDir, 'kvs.json'), JSON.stringify(kvs, null, 2))
    },
  }
}


/**
 * RecordId: number // positive integer
 * RecordType: 'note' | 'todo'
 * Record: { type: RecordType, id: string, name: string, data: string, files: File[] }
 * File: { id: string, name: string }
 * NewFile: { name: string, data: Buffer }
 * Attachment: { id: string, name: string, data: Buffer }
 */
export default function createStorage(baseDir) {
  const cache = {
    records: {}, // [Record.type]: { [Record.id]: Record }
    files: {}, // [File.id]: File
    kvs: {}, // [namespace]: { [key]: value }
  }

  let immediateId = null
  let closeCb
  const _queue = []
  const fs = createStorageFs(baseDir)

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

  async function removeUnusedFiles() {
    const idsInUse = uniq(Object.values(cache.records).reduce((ids, record) => ids.push(...record.files.map(file => file.id)), []))
    const allIds = Object.keys(cache.files)

    const unusedIds = allIds.filter(fileId => !idsInUse.includes(fileId))

    await Promise.all(unusedIds.map(async (fileId) => {
      await fs.removeAttachment(fileId, cache.files[fileId].name)
      delete cache.files[fileId]
    }))
  }

  async function saveRecord(id, type, name, data, attachments) {
    const prevRecord = cache.records[id]
    if (prevRecord && prevRecord.type !== type) throw new Error(`Wrong type ${prevRecord.type}, should be ${type}`)

    const fileIds = extractFileIds(parse(data))

    const newIds = fileIds.filter(fileId => !cache.files[fileId])
    if (newIds.length !== attachments.length) console.error('WARN: there are redundant new files')

    const attachedFiles = {}
    for (const attachment of attachments) {
      attachedFiles[utils.sha256(attachment.data)] = attachment
    }

    const unknownIds = newIds.filter(fileId => !attachedFiles[fileId])
    if (unknownIds.length) throw new Error(`Can't attach files with unknown ids: ${unknownIds}`)

    let newFiles = [] // File[]
    try {
      // 1. write new files
      newFiles = await Promise.all(newIds.map(async (fileId) => {
        const file = attachedFiles[fileId]
        await fs.writeAttachment(fileId, file.name, file.data)

        return { id: fileId, name: file.name }
      }))

      // 2. write new record data
      await fs.writeRecord(id, type, name, data)
    } catch (e) {
      console.error('failed to save record', e)

      // remove leftover files
      await Promise.all(newFiles.map(file => fs.removeAttachment(file.id, file.name)))

      throw e
    }

    // 3. update files cache
    for (const file of newFiles) {
      cache.files[file.id] = file
    }

    // 4. update records cache
    const record = { id, type, name, data, files: fileIds.map(fileId => cache.files[fileId]) }
    cache.records[id] = record

    // 5. remove unused files if needed
    if (prevRecord) await removeUnusedFiles()

    return record
  }

  // FIXME fill cache

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
      return queue(async () => {
        const record = cache.records[id]
        if (!record) throw new Error(`Record ${id} doesn't exist`)

        await fs.removeRecord(id, record.type, record.name)
        await removeUnusedFiles()
      })
    },

    /**
     * @returns {Attachment?}
     */
    readFile(fileId) {
      return queue(async () => {
        const attachment = cache.files[fileId]
        if (!attachment) return null

        return {
          ...attachment,
          data: await fs.readAttachment(fileId, attachment.name),
        }
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

        await fs.writeKvs(kvs)

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
