/* eslint-disable no-underscore-dangle */
import path from 'path';
import nodeFs from 'fs';
import { recentComparator } from 'shared/utils';
import * as utils from 'core/utils';
import probeMetadata from 'core/utils/probe';
import log from 'shared/log';
import { validateAll, assertAll } from 'core/validator';
import createCache from './cache';

// FileInfo: { id: string, mimeType: string, updatedTs: number, size: number, meta: {} }
// Record: { type: RecordType, id: string, fields: object, updatedTs: number, files: FileInfo[] }

class Storage {
  rootDir = null;
  _cache = null;

  constructor(rootDir) {
    log.info('storage: root dir: ', rootDir);
    this.rootDir = rootDir;
  }

  async init() {
    await this._initDirs();

    const files = await this._listFiles();
    const records = await this._listRecords(id => files.find(file => file.id === id));
    this._cache = await createCache(records, files);
    log.info(`storage: ${this._cache.records.length} records, ${this._cache.files.length} files`);
  }

  /**
    * @returns {{ items: Record[], total: number }}
    */
  listRecords({ size = 50, skip = 0, filter = () => true }) {
    assertAll(
      [ size, 'non-negative-integer' ],
      [ skip, 'non-negative-integer' ],
      [ filter, 'function' ],
    );

    const results = this._cache.records.filter(filter).sort(recentComparator);

    return {
      total: results.length,

      // apply pagination
      // handles special case when size is 0 which means "no size limit"
      items: results.filter((_, i) => i >= skip && (size === 0 ? true : i < skip + size)),
    };
  }

  /**
    * @returns {Record?}
    */
  readRecord(id) {
    assertAll(
      [ id, 'record-id' ],
    );

    return this._cache.getRecord(id) || null;
  }

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

    const id = Math.max(0, ...this._cache.getRecordIds()) + 1;

    return this._saveRecord(id, type, fields, fileIds, attachments);
  }

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

    const record = this._cache.getRecord(id);
    if (!record) throw new Error(`Record ${id} doesn't exist`);

    return this._saveRecord(id, record.type, fields, fileIds, attachments);
  }

  /**
    * @returns {Promise}
    */
  async deleteRecord(id) {
    assertAll(
      [ id, 'record-id' ],
    );

    if (!this._cache.getRecord(id)) throw new Error(`Record ${id} doesn't exist`);

    await nodeFs.promises.unlink(this._getRecordPath(id));
    this._cache.removeRecord(id);

    await this._removeUnusedFiles();
  }

  readFile(id) {
    assertAll(
      [ id, 'file-id' ],
    );

    const file = this._cache.getFile(id);
    if (!file) return null;

    return {
      file,
      stream: nodeFs.createReadStream(this._getFilePath(id)),
    };
  }

  // -----------------

  _getFilePath = id => path.join(this.rootDir, 'files', id);
  _getRecordPath = id => path.join(this.rootDir, `${id}.mb`);

  async _initDirs() {
    const dirs = [ this.rootDir, path.join(this.rootDir, 'files') ];

    for (const dir of dirs) {
      if (await utils.existsFile(dir)) {
        if (!await utils.isDirectory(dir)) throw new Error(`${dir} must be a directory`);
        return;
      }

      await nodeFs.promises.mkdir(dir);
    }
  }

  async _listFiles() {
    const fileNames = await utils.listFiles(path.join(this.rootDir, 'files'));

    const files = {};

    await Promise.all(fileNames.map(async (id) => {
      const validationErrors = validateAll([ id, 'file-id' ]);
      if (validationErrors.length) {
        log.warn(`storage: files: validation failed for file ${id}`, validationErrors);
        return;
      }

      const filePath = this._getFilePath(id);
      const realHash = await utils.sha256File(filePath);

      if (realHash !== id) throw new Error(`files: wrong hash in file ${id}: ${realHash}`);
      if (files[id]) throw new Error(`files: duplicate file with id ${id}`);

      files[id] = await this._readFileInfo(id);
    }));

    return Object.values(files);
  }

  async _readFileInfo(id) {
    const filePath = this._getFilePath(id);

    const mimeType = await utils.getMimeType(filePath);
    const stats = await nodeFs.promises.lstat(filePath);
    const meta = await probeMetadata(filePath);

    return { id, mimeType, updatedTs: stats.mtimeMs, size: stats.size, meta };
  }

  async _listRecords(getFile) {
    const recordIds = [];
    for (const fileName of await utils.listFiles(this.rootDir)) {
      if (!fileName.endsWith('.mb')) {
        log.warn(`storage: records: unexpected file ${fileName}`);
        continue;
      }

      const id = parseInt(fileName.substring(0, fileName.length - 3), 10);

      const validationErrors = validateAll([ id, 'record-id' ]);
      if (validationErrors.length) {
        log.warn(`storage: records: validation failed for ${fileName}`, validationErrors);
        throw new Error(`records: validation failed for ${fileName}`);
      }

      if (recordIds.includes(id)) throw new Error(`records: duplicate record with id ${id}: ${fileName}`);

      recordIds.push(id);
    }

    return Promise.all(recordIds.map(id => this._readRecord(id, getFile)));
  }

  async _readRecord(id, getFile) {
    const recordFile = this._getRecordPath(id);
    const { type, fields, fileIds, updatedTs } = await utils.readJSON(recordFile);

    const files = fileIds.map((fileId) => {
      const file = getFile(fileId);
      if (!file) throw new Error(`records: record ${id} references unknown file ${fileId}`);

      return file;
    });

    return { id, type, fields, files, updatedTs };
  }

  async _removeUnusedFiles() {
    const idsInUse = this._cache.getFileIdsInUse();
    const unusedIds = this._cache.getFileIds().filter(id => !idsInUse.includes(id));

    await Promise.all(unusedIds.map(async (id) => {
      await this._removeFile(id);
      this._cache.removeFile(id);
    }));
  }

  async _removeFile(id) {
    try {
      await nodeFs.promises.unlink(this._getFilePath(id));
    } catch (e) {
      log.error(`storage: files: failed to remove file ${id}`, e);
    }
  }

  async _saveRecord(id, type, fields, fileIds, attachments) {
    const prevRecord = this._cache.getRecord(id);
    if (prevRecord && prevRecord.type !== type) throw new Error(`Wrong type ${prevRecord.type}, should be ${type}`);

    const newIds = fileIds.filter(fileId => !this._cache.getFile(fileId));
    if (newIds.length !== attachments.length) log.info('storage: there are redundant attachments');

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
        await this._writeFile(fileId, attachedFiles[fileId]);

        return this._readFileInfo(fileId);
      }));

      // 2. write new record fields
      await this._writeRecord(id, type, fields, fileIds);
    } catch (e) {
      log.error('storage: failed to save record', e);

      // remove leftover files
      await Promise.all(newFiles.map(file => this._removeFile(file.id)));

      throw e;
    }

    // 3. update files cache
    newFiles.forEach(file => this._cache.addFile(file));

    // 4. update records cache
    const record = await this._readRecord(id, this._cache.getFile);
    this._cache.removeRecord(id);
    this._cache.addRecord(record);

    // 5. remove unused files if needed
    if (prevRecord) await this._removeUnusedFiles();

    return record;
  }

  async _writeFile(id, data) {
    await nodeFs.promises.writeFile(this._getFilePath(id), data);
  }

  async _writeRecord(id, type, fields, fileIds) {
    const file = this._getRecordPath(id);
    const tempFile = `${file}.atomic-temp`;

    try {
      // write into temp file and then rename temp file to achieve "atomic" file writes
      await utils.writeJSON(tempFile, { type, fields, fileIds, updatedTs: Date.now() });
      await nodeFs.promises.rename(tempFile, file);
    } catch (e) {
      await nodeFs.promises.unlink(tempFile); // cleanup temp file if operation fails
      throw e;
    }
  }
}

export default async function createStorage(rootDir) {
  const storage = new Storage(rootDir);

  await storage.init();

  return storage;
}
