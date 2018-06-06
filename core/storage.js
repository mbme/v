import path from 'path';
import nodeFs from 'fs';
import { uniq, flatten, recentComparator } from 'shared/utils';
import * as utils from './utils';
import probeMetadata from './utils/probe';
import { validateAll, assertAll } from './validator';

function createStorageFs(rootDir) {
  const getFilePath = id => path.join(rootDir, 'files', id);
  const getRecordPath = id => path.join(rootDir, `${id}.mb`);

  return {
    async initDirs() {
      const dirs = [ rootDir, path.join(rootDir, 'files') ];

      for (const dir of dirs) {
        if (await utils.existsFile(dir)) {
          if (!await utils.isDirectory(dir)) throw new Error(`${dir} must be a directory`);
          return;
        }

        await nodeFs.promises.mkdir(dir);
      }
    },

    async listFiles() {
      const fileNames = await utils.listFiles(path.join(rootDir, 'files'));

      const files = {};

      await Promise.all(fileNames.map(async (id) => {
        const validationErrors = validateAll([ id, 'file-id' ]);
        if (validationErrors.length) {
          console.log(`files: validation failed for file ${id}`, validationErrors);
          return;
        }

        const filePath = getFilePath(id);
        const realHash = await utils.sha256File(filePath);

        if (realHash !== id) throw new Error(`files: wrong hash in file ${id}: ${realHash}`);
        if (files[id]) throw new Error(`files: duplicate file with id ${id}`);

        files[id] = await this.readFileInfo(id);
      }));

      return Object.values(files);
    },

    async readFileInfo(id) {
      const filePath = getFilePath(id);

      const mimeType = await utils.getMimeType(filePath);
      const stats = await nodeFs.promises.lstat(filePath);
      const meta = await probeMetadata(filePath);

      return { id, mimeType, updatedTs: stats.mtimeMs, size: stats.size, meta };
    },

    async writeFile(id, data) {
      await nodeFs.promises.writeFile(getFilePath(id), data);
    },

    async removeFile(id) {
      try {
        await nodeFs.promises.unlink(getFilePath(id));
      } catch (e) {
        console.error(`files: failed to remove file ${id}`, e);
      }
    },

    getFileStream(id) {
      return nodeFs.createReadStream(getFilePath(id));
    },

    async listRecords(getFile) {
      const recordIds = [];
      for (const fileName of await utils.listFiles(rootDir)) {
        if (!fileName.endsWith('.mb')) {
          console.log(`records: unexpected file ${fileName}`);
          continue;
        }

        const id = parseInt(fileName.substring(0, fileName.length - 3), 10);

        const validationErrors = validateAll([ id, 'record-id' ]);
        if (validationErrors.length) {
          console.log(`Validation failed for ${fileName}`, validationErrors);
          throw new Error(`records: validation failed for ${fileName}`);
        }

        if (recordIds.includes(id)) throw new Error(`records: duplicate record with id ${id}: ${fileName}`);

        recordIds.push(id);
      }

      return Promise.all(recordIds.map(id => this.readRecord(id, getFile)));
    },

    async readRecord(id, getFile) {
      const recordFile = getRecordPath(id);
      const { type, fields, fileIds, updatedTs } = await utils.readJSON(recordFile);

      const files = fileIds.map((fileId) => {
        const file = getFile(fileId);
        if (!file) throw new Error(`records: record ${id} references unknown file ${fileId}`);

        return file;
      });

      return { id, type, fields, files, updatedTs };
    },

    async writeRecord(id, type, fields, fileIds) {
      const file = getRecordPath(id);
      const tempFile = `${file}.atomic-temp`;

      try {
        // write into temp file and then rename temp file to achieve "atomic" file writes
        await utils.writeJSON(tempFile, { type, fields, fileIds, updatedTs: Date.now() });
        await nodeFs.promises.rename(tempFile, file);
      } catch (e) {
        await nodeFs.promises.unlink(tempFile); // cleanup temp file if operation fails
        throw e;
      }
    },

    async removeRecord(id) {
      await nodeFs.promises.unlink(getRecordPath(id));
    },
  };
}

async function createCache(fs) {
  const files = await fs.listFiles();
  const records = await fs.listRecords(id => files.find(file => file.id === id));

  return {
    files,
    getFileIds: () => files.map(file => file.id),
    getFile: id => files.find(file => file.id === id),
    removeFile(id) {
      const pos = files.findIndex(file => file.id === id);
      if (pos !== -1) files.splice(pos, 1);
    },
    addFile: file => files.push(file),

    records,
    getRecordIds: () => records.map(record => record.id),
    getRecord: id => records.find(record => record.id === id),
    removeRecord(id) {
      const pos = records.findIndex(record => record.id === id);
      if (pos !== -1) records.splice(pos, 1);
    },
    addRecord: record => records.push(record),
  };
}

/**
 * FileInfo: { id: string, mimeType: string, updatedTs: number, size: number, meta: {} }
 * Record: { type: RecordType, id: string, fields: object, updatedTs: number, files: FileInfo[] }
 */
export default async function createStorage(rootDir) {
  console.log('root dir: ', rootDir);

  const fs = createStorageFs(rootDir);
  await fs.initDirs();

  const cache = await createCache(fs);
  console.log(`storage: ${cache.records.length} records, ${cache.files.length} files`);

  async function removeUnusedFiles() {
    const idsInUse = uniq(flatten(cache.records.map(record => record.files.map(file => file.id))));
    const unusedIds = cache.getFileIds().filter(id => !idsInUse.includes(id));

    await Promise.all(unusedIds.map(async (id) => {
      await fs.removeFile(id);
      cache.removeFile(id);
    }));
  }

  async function saveRecord(id, type, fields, fileIds, attachments) {
    const prevRecord = cache.getRecord(id);
    if (prevRecord && prevRecord.type !== type) throw new Error(`Wrong type ${prevRecord.type}, should be ${type}`);

    const newIds = fileIds.filter(fileId => !cache.getFile(fileId));
    if (newIds.length !== attachments.length) console.error('WARN: there are redundant attachments');

    const attachedFiles = {};
    for (const attachment of attachments) {
      attachedFiles[utils.sha256(attachment)] = attachment;
    }

    const unknownIds = newIds.filter(fileId => !attachedFiles[fileId]);
    if (unknownIds.length) throw new Error(`Can't attach files with unknown ids: ${unknownIds}`);

    let newFiles = []; // FileInfo[]
    try {
      // 1. write new files
      newFiles = await Promise.all(newIds.map(async (fileId) => {
        await fs.writeFile(fileId, attachedFiles[fileId]);

        return fs.readFileInfo(fileId);
      }));

      // 2. write new record fields
      await fs.writeRecord(id, type, fields, fileIds);
    } catch (e) {
      console.error('failed to save record', e);

      // remove leftover files
      await Promise.all(newFiles.map(file => fs.removeFile(file.id)));

      throw e;
    }

    // 3. update files cache
    newFiles.forEach(file => cache.addFile(file));

    // 4. update records cache
    const record = await fs.readRecord(id, cache.getFile);
    cache.removeRecord(id);
    cache.addRecord(record);

    // 5. remove unused files if needed
    if (prevRecord) await removeUnusedFiles();

    return record;
  }

  return {
    /**
     * @returns {{ items: Record[], total: number }}
     */
    listRecords(type, { size = 50, skip = 0, filter = () => true }) {
      assertAll(
        [ size, 'non-negative-integer' ],
        [ skip, 'non-negative-integer' ],
        [ type, 'record-type' ],
        [ filter, 'function' ],
      );

      const results = cache.records
        .filter(record => record.type === type && filter(record))
        .sort(recentComparator);

      return {
        total: results.length,

        // apply pagination
        // handles special case when size is 0 which means "no size limit"
        items: results.filter((_, i) => i >= skip && (size === 0 ? true : i < skip + size)),
      };
    },

    /**
     * @returns {Record?}
     */
    readRecord(id) {
      assertAll(
        [ id, 'record-id' ],
      );

      return cache.getRecord(id) || null;
    },

    /**
     * @returns {Promise<Record>}
     */
    createRecord(type, fields, fileIds, attachments) {
      assertAll(
        [ type, 'record-type' ],
        [ fields, 'record-fields' ],
        [ fileIds, 'file-id[]' ],
        [ attachments, 'buffer[]' ],
      );

      const id = Math.max(0, ...cache.getRecordIds()) + 1;

      return saveRecord(id, type, fields, fileIds, attachments);
    },

    /**
     * @returns {Promise<Record>}
     */
    updateRecord(id, fields, fileIds, attachments) {
      assertAll(
        [ id, 'record-id' ],
        [ fields, 'record-fields' ],
        [ fileIds, 'file-id[]' ],
        [ attachments, 'buffer[]' ],
      );

      const record = cache.getRecord(id);
      if (!record) throw new Error(`Record ${id} doesn't exist`);

      return saveRecord(id, record.type, fields, fileIds, attachments);
    },

    /**
     * @returns {Promise}
     */
    async deleteRecord(id) {
      assertAll(
        [ id, 'record-id' ],
      );

      if (!cache.getRecord(id)) throw new Error(`Record ${id} doesn't exist`);

      await fs.removeRecord(id);
      cache.removeRecord(id);

      await removeUnusedFiles();
    },

    readFile(id) {
      assertAll(
        [ id, 'file-id' ],
      );

      const file = cache.getFile(id);
      if (!file) return null;

      return {
        file,
        stream: fs.getFileStream(id),
      };
    },
  };
}
