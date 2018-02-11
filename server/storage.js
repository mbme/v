import path from 'path'
import nodeFs from 'fs'
import { extractFileIds, parse } from 'shared/parser'
import { validateAll, assertAll } from 'shared/types'
import { uniq, flatten, isAsyncFunction } from 'shared/utils'
import * as utils from 'server/utils'

function createStorageFs(rootDir) {
  const getFilePath = id => path.join(rootDir, 'files', id)
  const getRecordPath = id => path.join(rootDir, `${id}.mb`)

  return {
    async initDirs() {
      const dirs = [ rootDir, path.join(rootDir, 'files') ]

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

      await Promise.all(fileNames.map(async (id) => {
        const validationErrors = validateAll([ id, 'file-id' ])
        if (validationErrors.length) {
          console.log(`files: validation failed for file ${id}`, validationErrors)
          return
        }

        const filePath = getFilePath(id)
        const realHash = await utils.sha256File(filePath)

        if (realHash !== id) throw new Error(`files: wrong hash in file ${id}: ${realHash}`)
        if (files[id]) throw new Error(`files: duplicate file with id ${id}`)

        files[id] = await this.readFileInfo(id)
      }))

      return Object.values(files)
    },

    async readFileInfo(id) {
      const filePath = getFilePath(id)

      const mimeType = await utils.getMimeType(filePath)
      const stats = await utils.statFile(filePath)

      return { id, mimeType, updatedTs: stats.mtimeMs, size: stats.size }
    },

    async writeFile(id, data) {
      await utils.writeFile(getFilePath(id), data)
    },

    async removeFile(id) {
      try {
        await utils.deleteFile(getFilePath(id))
      } catch (e) {
        console.error(`files: failed to remove file ${id}`, e)
      }
    },

    getFileStream(id) {
      return nodeFs.createReadStream(getFilePath(id))
    },

    async listRecords(getFile) {
      const recordIds = []
      for (const fileName of await utils.listFiles(rootDir)) {
        if (!fileName.endsWith('.mb')) {
          console.log(`records: unexpected file ${fileName}`)
          continue
        }

        const id = parseInt(fileName.substring(0, fileName.length - 3), 10)

        const validationErrors = validateAll([ id, 'record-id' ])
        if (validationErrors.length) {
          console.log(`Validation failed for ${fileName}`, validationErrors)
          throw new Error(`records: validation failed for ${fileName}`)
        }

        if (recordIds.includes(id)) throw new Error(`records: duplicate record with id ${id}: ${fileName}`)

        recordIds.push(id)
      }

      const records = {}

      await Promise.all(recordIds.map(async (id) => {
        records[id] = await this.readRecord(id, getFile)
      }))

      return Object.values(records)
    },

    async readRecord(id, getFile) {
      const recordFile = getRecordPath(id)
      const { type, name, data, updatedTs } = await utils.readJSON(recordFile)

      const files = extractFileIds(parse(data)).map((fileId) => {
        const file = getFile(fileId)
        if (!file) throw new Error(`records: record ${id} references unknown file ${fileId}`)

        return file
      })

      return { id, type, name, data, files, updatedTs }
    },

    async writeRecord(id, type, name, data) {
      const file = getRecordPath(id)
      const tempFile = `${file}.atomic-temp`

      try {
        // write into temp file and then rename temp file to achieve "atomic" file writes
        await utils.writeJSON(tempFile, { type, name, data, updatedTs: Date.now() })
        await utils.renameFile(tempFile, file)
      } catch (e) {
        await utils.deleteFile(tempFile) // cleanup temp file if operation fails
        throw e
      }
    },

    async removeRecord(id) {
      await utils.deleteFile(getRecordPath(id))
    },
  }
}

async function createCache(fs) {
  const files = await fs.listFiles()
  const records = await fs.listRecords(id => files.find(file => file.id === id))

  return {
    files,
    getFileIds: () => files.map(file => file.id),
    getFile: id => files.find(file => file.id === id),
    removeFile(id) {
      const pos = files.findIndex(file => file.id === id)
      if (pos !== -1) files.splice(pos, 1)
    },
    addFile: file => files.push(file),

    records,
    getRecordIds: () => records.map(record => record.id),
    getRecord: id => records.find(record => record.id === id),
    removeRecord(id) {
      const pos = records.findIndex(record => record.id === id)
      if (pos !== -1) records.splice(pos, 1)
    },
    addRecord: record => records.push(record),
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
 * FileInfo: { id: string, mimeType: string, updatedTs: number, size: number }
 * Record: { type: RecordType, id: string, name: string, data: string, updatedTs: number, files: FileInfo[] }
 */
export default async function createStorage(rootDir) {
  console.log('root dir: ', rootDir)

  const fs = createStorageFs(rootDir)
  await fs.initDirs()

  const cache = await createCache(fs)
  console.log(`storage: ${cache.records.length} records, ${cache.files.length} files`)

  const queue = createQueue()

  async function removeUnusedFiles() {
    const idsInUse = uniq(flatten(cache.records.map(record => record.files.map(file => file.id))))
    const unusedIds = cache.getFileIds().filter(id => !idsInUse.includes(id))

    await Promise.all(unusedIds.map(async (id) => {
      await fs.removeFile(id)
      cache.removeFile(id)
    }))
  }

  async function saveRecord(id, type, name, data, attachments) {
    const prevRecord = cache.getRecord(id)
    if (prevRecord && prevRecord.type !== type) throw new Error(`Wrong type ${prevRecord.type}, should be ${type}`)

    const fileIds = extractFileIds(parse(data))

    const newIds = fileIds.filter(fileId => !cache.getFile(fileId))
    if (newIds.length !== attachments.length) console.error('WARN: there are redundant attachments')

    const attachedFiles = {}
    for (const attachment of attachments) {
      attachedFiles[utils.sha256(attachment)] = attachment
    }

    const unknownIds = newIds.filter(fileId => !attachedFiles[fileId])
    if (unknownIds.length) throw new Error(`Can't attach files with unknown ids: ${unknownIds}`)

    let newFiles = [] // FileInfo[]
    try {
      // 1. write new files
      newFiles = await Promise.all(newIds.map(async (fileId) => {
        await fs.writeFile(fileId, attachedFiles[fileId])

        return fs.readFileInfo(fileId)
      }))

      // 2. write new record data
      await fs.writeRecord(id, type, name, data)
    } catch (e) {
      console.error('failed to save record', e)

      // remove leftover files
      await Promise.all(newFiles.map(file => fs.removeFile(file.id)))

      throw e
    }

    // 3. update files cache
    newFiles.forEach(file => cache.addFile(file))

    // 4. update records cache
    const record = await fs.readRecord(id, cache.getFile)
    cache.removeRecord(id)
    cache.addRecord(record)

    // 5. remove unused files if needed
    if (prevRecord) await removeUnusedFiles()

    return record
  }

  return {
    /**
     * @returns {Promise<Record[]>}
     */
    listRecords(type) {
      return queue.push(async () => {
        assertAll(
          [ type, 'record-type' ],
        )

        return cache.records.filter(record => record.type === type)
      })
    },

    /**
     * @returns {Promise<Record?>}
     */
    readRecord(id) {
      return queue.push(async () => {
        assertAll(
          [ id, 'record-id' ],
        )

        return cache.getRecord(id) || null
      })
    },

    createRecord(type, name, data, attachments) {
      return queue.push(async () => {
        assertAll(
          [ type, 'record-type' ],
          [ name, 'record-name' ],
          [ data, 'record-data' ],
          [ attachments, 'buffer[]' ],
        )

        const id = Math.max(0, ...cache.getRecordIds()) + 1

        return saveRecord(id, type, name, data, attachments)
      })
    },

    updateRecord(id, name, data, attachments) {
      return queue.push(async () => {
        assertAll(
          [ id, 'record-id' ],
          [ name, 'record-name' ],
          [ data, 'record-data' ],
          [ attachments, 'buffer[]' ],
        )

        const record = cache.getRecord(id)
        if (!record) throw new Error(`Record ${id} doesn't exist`)

        return saveRecord(id, record.type, name, data, attachments)
      })
    },

    deleteRecord(id) {
      return queue.push(async () => {
        assertAll(
          [ id, 'record-id' ],
        )

        if (!cache.getRecord(id)) throw new Error(`Record ${id} doesn't exist`)

        await fs.removeRecord(id)
        cache.removeRecord(id)

        await removeUnusedFiles()
      })
    },

    readFile(id) {
      return queue.push(async () => {
        assertAll(
          [ id, 'file-id' ],
        )

        const file = cache.getFile(id)
        if (!file) return null

        return {
          file,
          stream: fs.getFileStream(id),
        }
      })
    },

    close() {
      return new Promise(resolve => queue.close(resolve))
    },
  }
}
