import path from 'path'
import nodeFs from 'fs'
import { extractFileIds, parse } from 'shared/parser'
import { validateAll, RECORD_TYPES } from 'shared/types'
import { uniq, flatten, isAsyncFunction } from 'shared/utils'
import * as utils from 'server/utils'

// TODO file size, updatedTs
// TODO use Map instead of objects

function createStorageFs(rootDir) {
  const getFilePath = (id, name) => path.join(rootDir, 'files', `${id}_${name}`)
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

    async listFiles() {
      const fileNames = await utils.listFiles(path.join(rootDir, 'files'))

      const files = {}

      await Promise.all(fileNames.map(async (fileName) => {
        const [ id, name ] = fileName.split('_')

        const validationErrors = validateAll([ id, 'file-id' ], [ name, 'file-name' ])
        if (validationErrors.length) {
          console.log(`files: validation failed for file ${fileName}`, validationErrors)
          return
        }

        const realHash = await utils.sha256File(path.join(rootDir, 'files', fileName))

        if (realHash !== id) throw new Error(`files: wrong hash in file ${fileName}: ${realHash}`)
        if (files[id]) throw new Error(`files: duplicate file with id ${id}: ${name}`)

        files[id] = { id, name }
      }))

      return files
    },

    async writeFile(id, name, data) {
      await utils.writeFile(getFilePath(id, name), data)
    },

    async removeFile(id, name) {
      try {
        await utils.deleteFile(getFilePath(id, name))
      } catch (e) {
        console.error(`files: failed to remove file ${id}`, e)
      }
    },

    getFileStream(id, name) {
      return nodeFs.createReadStream(getFilePath(id, name))
    },

    async listRecords(filesCache) {
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

          const validationErrors = validateAll([ id, 'record-id' ], [ name, 'record-name' ])
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
        records[id] = await this.readRecord(id, type, name, filesCache)
      }))

      return records
    },

    async readRecord(id, type, name, filesCache) {
      const recordFile = getRecordPath(id, type, name)
      const stats = await utils.statFile(recordFile)
      const data = await utils.readText(recordFile)

      const files = extractFileIds(parse(data)).reduce((acc, fileId) => {
        const file = filesCache[fileId]
        if (!file) throw new Error(`records: record ${id} references unknown file ${fileId}`)

        acc.push(file)

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
 * FileInfo: { id: string, name: string }
 * Record: { type: RecordType, id: string, name: string, data: string, updatedTs: number, files: FileInfo[] }
 *
 * NewFile: { name: string, data: Buffer }
 *
 * File: { id: string, name: string, data: ReadableStream }
 *
 */
export default async function createStorage(rootDir) {
  const fs = createStorageFs(rootDir)
  await fs.initDirs()

  const cache = {
    records: {}, //  [Record.id]: Record
    files: {}, // [File.id]: FileInfo
  }
  cache.files = await fs.listFiles()
  cache.records = await fs.listRecords(cache.files)
  console.log(`Storage initialized: ${Object.keys(cache.records).length} records, ${Object.keys(cache.files).length} files`)

  const queue = createQueue()

  async function removeUnusedFiles() {
    const idsInUse = uniq(flatten(Object.values(cache.records).map(record => record.files.map(file => file.id))))
    const allIds = Object.keys(cache.files)

    const unusedIds = allIds.filter(fileId => !idsInUse.includes(fileId))

    await Promise.all(unusedIds.map(async (fileId) => {
      await fs.removeFile(fileId, cache.files[fileId].name)
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
        await fs.writeFile(fileId, file.name, file.data)

        return { id: fileId, name: file.name }
      }))

      // 2. write new record data
      await fs.writeRecord(id, type, name, data)
    } catch (e) {
      console.error('failed to save record', e)

      // remove leftover files
      await Promise.all(newFiles.map(file => fs.removeFile(file.id, file.name)))

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
     * @returns {Promise<File?>}
     */
    readFile(fileId) {
      return queue.push(async () => {
        const attachment = cache.files[fileId]
        if (!attachment) return null

        return {
          ...attachment,
          data: fs.getFileStream(fileId, attachment.name),
        }
      })
    },

    close() {
      return new Promise(resolve => queue.close(resolve))
    },
  }
}
