import path from 'path'
import { extractFileIds, parse } from 'shared/parser'
import { validateAll, RECORD_TYPES } from 'shared/types'
import { uniq, flatten, isAsyncFunction } from 'shared/utils'
import * as utils from 'server/utils'

// TODO file size, updatedTs
// TODO use Map instead of objects

function createStorageFs(rootDir) {
  const getAttachmentPath = (id, name) => path.join(rootDir, 'files', `${id}_${name}`)
  const getRecordPath = (id, type, name) => path.join(rootDir, type, `${id}_${name}.mb`)

  return {
    async initDirs() {
      const dirs = [
        rootDir,
        path.join(rootDir, 'files'),
        ...RECORD_TYPES.map(type => path.join(rootDir, type)),
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
      const files = await utils.listFiles(path.join(rootDir, 'files'))

      const attachments = {}

      await Promise.all(files.map(async (fileName) => {
        const [ id, name ] = fileName.split('_')
        if (validateAll([ id, 'file-id' ], [ name, 'file-name' ]).length) {
          console.log(`attachments: unexpected file ${fileName}`)
          return
        }

        const realHash = await utils.sha256File(path.join(rootDir, 'files', fileName))

        if (realHash !== id) throw new Error(`attachments: wrong hash in file ${fileName}: ${realHash}`)
        if (attachments[id]) throw new Error(`attachments: duplicate file with id ${id}: ${name}`)

        attachments[id] = { id, name }
      }))

      return attachments
    },

    async writeAttachment(id, name, data) {
      await utils.writeFile(getAttachmentPath(id, name), data)
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
      const fileNames = await Promise.all(RECORD_TYPES.map(type => utils.listFiles(path.join(rootDir, type))))

      const recordInfo = {}
      for (let i = 0; i < RECORD_TYPES.length; i += 1) {
        const type = RECORD_TYPES[i]

        for (const fileName of fileNames[i]) {
          if (!fileName.endsWith('.mb')) {
            console.log(`records: unexpected file ${type}/${fileName}`)
            continue
          }

          const [ idStr, name ] = fileName.substring(0, fileName.length - 3).split('_')
          const id = parseInt(idStr, 10)

          const validationErrors = validateAll([ 'record-id', id ], [ 'record-name', name ])
          if (validationErrors.length) {
            console.log(`Validation failed for ${type}/${fileName}`, validationErrors)
            throw new Error(`records: validation failed for ${type}/${fileName}`)
          }

          if (recordInfo[id]) throw new Error(`records: duplicate record with id ${id}: ${type}/${fileName}`)

          recordInfo[i] = { id, type, name }
        }
      }

      const records = {}

      await Promise.all(Object.values(recordInfo).map(async ({ id, type, name }) => {
        records[id] = await this.readRecord(id, type, name, attachments)
      }))

      return records
    },

    async readRecord(id, type, name, attachments) {
      const file = getRecordPath(id, type, name)
      const stats = await utils.statFile(file)
      const data = await utils.readText(file)

      const files = extractFileIds(parse(data)).reduce((acc, fileId) => {
        const attachment = attachments[fileId]
        if (!attachment) throw new Error(`records: record ${id} references unknown attachment ${fileId}`)

        acc.push(attachment)

        return acc
      }, [])

      return { id, type, name, data, files, updatedTs: stats.mtimeMs }
    },

    async writeRecord(id, type, name, data) {
      const file = getRecordPath(id, type, name)
      const tempFile = `${file}.atomic-temp`

      try {
        // write into temp file and then rename temp file to achieve "atomic" file writes
        await utils.writeText(tempFile, data)
        await utils.renameFile(tempFile, file)
      } catch (e) {
        await utils.deleteFile(tempFile) // cleanup temp file if operation fails
        throw e
      }
    },

    async removeRecord(id, type, name) {
      await utils.deleteFile(getRecordPath(id, type, name))
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

  const runQueue = () => {
    if (!immediateId) immediateId = setImmediate(processQueue)
  }

  return {
    push(action) {
      if (!isAsyncFunction(action)) throw new Error('action must be async function')

      return new Promise((resolve, reject) => {
        if (onClose) throw new Error('closing storage')

        queue.push(() => action().then(resolve, reject))
        runQueue()
      })
    },

    close(cb) {
      onClose = cb
      runQueue()
    },
  }
}

/**
 * RecordId: number // positive integer
 * RecordType: one of RECORD_TYPES
 * Record: { type: RecordType, id: string, name: string, data: string, updatedTs: number, files: File[] }
 * File: { id: string, name: string }
 * NewFile: { name: string, data: Buffer }
 * Attachment: { id: string, name: string, data: Buffer }
 */
export default async function createStorage(rootDir) {
  const fs = createStorageFs(rootDir)
  await fs.initDirs()

  const cache = {
    records: {}, //  [Record.id]: Record
    files: {}, // [File.id]: File
  }
  cache.files = await fs.listAttachments()
  cache.records = await fs.listRecords(cache.files)
  console.log(`Storage initialized: ${Object.keys(cache.records).length} records, ${Object.keys(cache.files).length} files`)

  const queue = createQueue()

  async function removeUnusedFiles() {
    const idsInUse = uniq(flatten(Object.values(cache.records).map(record => record.files.map(file => file.id))))
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
    cache.records[id] = await fs.readRecord(id, type, name, cache.files)

    // 5. remove unused files if needed
    if (prevRecord) await removeUnusedFiles()

    return cache.records[id]
  }

  return {
    /**
     * @returns {Promise<Record[]>}
     */
    listRecords(type) {
      return queue.push(async () => Object.values(cache.records).filter(record => record.type === type))
    },

    /**
     * @returns {Promise<Record?>}
     */
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
     * @returns {Promise<Record>}
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
     * @returns {Promise<Record>}
     */
    updateRecord(id, name, data, attachments) {
      return queue.push(async () => {
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
        delete cache.records[id]

        await removeUnusedFiles()
      })
    },

    /**
     * @returns {Promise<Attachment?>}
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

    close() {
      return new Promise(resolve => queue.close(resolve))
    },
  }
}
