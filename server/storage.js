import path from 'path'
import { extractFileIds, parse } from 'shared/parser'
import { uniq, extend, isSha256 } from 'shared/utils'
import * as utils from 'server/utils'
import { validate } from 'server/validators'

export const RECORD_TYPES = [ 'note' ]

// TODO size, createTs, updateTs
// TODO use Map instead of objects

function createStorageFs(baseDir) {
  async function atomicWriteText(file, data) {
    await utils.writeText(`${file}.atomic-temp`, data)
    return utils.renameFile(`${file}.atomic-temp`, file)
  }

  const getAttachmentPath = (id, name) => path.join(baseDir, 'files', `${id}_${name}`)
  const getRecordPath = (id, type, name) => path.join(baseDir, type, `${id}_${name}.mb`)

  return {
    async initDirs() {
      const dirs = [
        baseDir,
        path.join(baseDir, 'files'),
        ...RECORD_TYPES.map(type => path.join(baseDir, type)),
      ]

      for (const dir of dirs) {
        if (await utils.existsFile(dir)) {
          if (!await utils.isDirectory(dir)) throw new Error(`${dir} must be a directory`)
          return
        }

        await utils.mkdir(dir)
      }
    },

    async listAttachments() {
      const files = await utils.listFiles(path.join(baseDir, 'files'))
      return files.reduce((acc, fileName) => {
        const [ id, name ] = fileName.split('_')

        if (name && isSha256(id)) {
          // TODO ensure id === sha256(readFile(fileName))
          // TODO check if id already in acc
          acc[id] = { id, name }
        } else {
          console.error(`WARN: attachments dir contains unexpected file ${fileName}`)
        }

        return acc
      }, {})
    },

    async writeAttachment(id, name, data) {
      const file = getAttachmentPath(id, name)
      if (utils.existsFile(file)) throw new Error(`Attachment ${file} already exists`)

      await utils.writeFile(file, data)
    },

    async removeAttachment(id, name) {
      try {
        await utils.deleteFile(getAttachmentPath(id, name))
      } catch (e) {
        console.error(`failed to remove attachment file ${id}`, e)
      }
    },

    async readAttachment(id, name) {
      return utils.readFile(getAttachmentPath(id, name))
    },

    async listRecords(attachments) {
      const fileNames = await Promise.all(RECORD_TYPES.map(type => utils.listFiles(path.join(baseDir, type))))

      const records = {}

      for (let i = 0; i < RECORD_TYPES.length; i += 1) {
        const type = RECORD_TYPES[i]

        for (const fileName of fileNames[i]) {
          const [ idStr, name ] = fileName.split('_')
          const id = parseInt(idStr, 10)

          // FIXME add validateFew method
          const validationErrors = [ ...validate(id, 'Record.id'), ...validate(name, 'Record.name') ]

          if (validationErrors.length) {
            console.error(`validation failed for ${type}/${fileName}`, validationErrors)
          } else {
            records[id] = { type, id, name, data: null, files: null }
          }
        }
      }

      // init record.data & record.files
      await Promise.all(Object.values(records).map(async (record) => {
        record.data = await utils.readText(getRecordPath(record.id, record.type, record.name)) // eslint-disable-line no-param-reassign
        record.files = extractFileIds(parse(record.data)).map(fileId => attachments[fileId]) // eslint-disable-line no-param-reassign
        // FIXME validate if all fileIds are known
      }))

      return records
    },

    async writeRecord(id, type, name, data) {
      await atomicWriteText(getRecordPath(id, type, name), data)
    },

    async removeRecord(id, type, name) {
      await utils.deleteFile(getRecordPath(id, type, name))
    },

    async writeKvs(kvs) {
      await atomicWriteText(path.join(baseDir, 'kvs.json'), JSON.stringify(kvs, null, 2))
    },

    async readKvs() {
      return utils.readJSON(path.join(baseDir, 'kvs.json'))
    },
  }
}

function createQueue() {
  let immediateId = null
  let onClose = null
  const queue = []

  async function processQueue() {
    while (queue.length) {
      const action = queue.shift()
      await action().catch(e => console.error('queued action failed', e))
    }
    immediateId = null
    if (onClose) onClose()
  }

  return {
    push(action) {
      return new Promise((resolve, reject) => {
        if (onClose) throw new Error('closing storage')

        queue.push(() => action().then(resolve, reject))

        if (!immediateId) immediateId = setImmediate(processQueue)
      })
    },

    close(cb) {
      onClose = cb
    },
  }
}

/**
 * RecordId: number // positive integer
 * RecordType: one of RECORD_TYPES
 * Record: { type: RecordType, id: string, name: string, data: string, files: File[] }
 * File: { id: string, name: string }
 * NewFile: { name: string, data: Buffer }
 * Attachment: { id: string, name: string, data: Buffer }
 */
export default async function createStorage(baseDir) {
  const fs = createStorageFs(baseDir)
  await fs.initDirs()

  const cache = {
    records: {}, //  [Record.id]: Record
    files: {}, // [File.id]: File
    kvs: {}, //  [namespace]: { [key]: value }
  }
  cache.kvs = await fs.readKvs()
  cache.files = await fs.listAttachments()
  cache.records = await fs.listRecords(cache.files)
  console.log(`Storage initialized: ${Object.keys(cache.records).length} records, ${Object.keys(cache.files).length} files`)

  const queue = createQueue()

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

  return {
    listRecords(type) {
      return queue.push(async () => Object.values(cache.records).filter(record => record.type === type))
    },

    readRecord(id) {
      return queue.push(async () => {
        const record = cache.records[id]
        if (!record) return null

        return record
      })
    },

    /**
     * @param {RecordType} type
     * @param {string} name
     * @param {string} data
     * @param {NewFile[]} attachments
     */
    createRecord(type, name, data, attachments) {
      return queue.push(async () => {
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
      return queue.push(() => {
        const record = cache.records[id]
        if (!record) throw new Error(`Record ${id} doesn't exist`)

        return saveRecord(id, record.type, name, data, attachments)
      })
    },

    deleteRecord(id) {
      return queue.push(async () => {
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
      return queue.push(async () => {
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
      return queue.push(() => {
        if (!cache.kvs[namespace]) return undefined

        return cache.kvs[namespace][key]
      })
    },

    set(namespace, key, value) {
      return queue.push(async () => {
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
      return new Promise(resolve => queue.close(resolve))
    },
  }
}
