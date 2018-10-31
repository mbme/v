import { assert } from '../asserts';
import { isString, array2object, flatten } from '../utils';
import { randomId } from '../randomizer';
import { createLogger } from '../logger';
import { findById } from './utils';

const logger = createLogger('isodb-replica');

// { // record
//   _id: 'zdfw234d2',
//   _rev: 2,
//   _refs: ['asdfsad'],
//   _deleted: true,
//   name: 'test',
//   data: 'x1',
// }
// { // attachment
//   _id: 'md5-2131321',
//   _rev: 2,
//   _attachment: true,
//   size: 10,
// }

const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 15;
const getRandomId = () => randomId(ID_ALPHABET, ID_LENGTH);

export default class ReplicaDB {
  _storage = null;

  constructor(storage) {
    this._storage = storage;
  }

  /**
   * @returns {number} storage revision
   */
  getRev() {
    return this._storage.getRev();
  }

  /**
   * @param {string} id attachment id
   * @returns {string?} path to attachment
   */
  getAttachmentUrl(id) {
    assert(id, 'string');

    return this._storage.getLocalAttachmentUrl(id)
      || this._storage.getAttachmentUrl(id);
  }

  /**
   * @param {string} id record id
   * @returns {Record?}
   */
  getRecord(id) {
    assert(id, 'string');

    return findById(this._storage.getLocalRecords(), id)
      || findById(this._storage.getRecords(), id)
      || null;
  }

  /**
   * @returns {[Record]} all records, including local
   */
  getAll() {
    const records = this._storage.getRecords();
    const localRecords = this._storage.getLocalRecords();
    const localIds = new Set(localRecords.map(item => item._id));

    return records.filter(item => !localIds.has(item._id)).concat(...localRecords);
  }

  /**
   * @param {string} id sha256 of file content
   * @param {File} blob file content
   * @param {Object} [fields] additional fields
   */
  addAttachment(id, blob, fields = {}) {
    assert(id, 'string');

    if (this.getRecord(id)) throw new Error(`can't add attachment ${id}: already exists`);

    // FIXME in transaction
    this._storage.addLocalRecord({
      _id: id,
      _attachment: true,
      ...fields,
    }, blob);
  }

  updateAttachment(id, fields) {
    assert(id, 'string');

    const record = this.getRecord(id);
    if (!record) throw new Error(`can't update attachment ${id}: doesn't exist`);
    if (!record._attachment) throw new Error(`can't update attachment ${id}: not an attachment`);

    this._storage.addLocalRecord({
      ...record,
      ...fields,
    });
  }

  /**
   * @param {Object} fields key-value object with fields
   * @param {[string]} [refs=[]] record's refs
   */
  addRecord(fields, refs = []) {
    const id = getRandomId();

    this._storage.addLocalRecord({
      _id: getRandomId(),
      _refs: refs,
      ...fields,
    });

    this._compact();

    return id;
  }

  /**
   * @param {string} id record id
   * @param {Object} fields key-value object with changed fields
   * @param {[string]} [refs] new refs (not used if record is attachment)
   * @param {boolean} [deleted=false] if record is deleted
   */
  updateRecord(id, fields, refs, deleted = false) {
    assert(id, 'string');

    const record = this.getRecord(id);
    if (!record) throw new Error(`can't update record ${id}: doesn't exist`);
    if (record._attachment) throw new Error(`can't update record ${id}: its an attachment`);

    this._storage.addLocalRecord({
      ...record,
      _refs: refs || record._refs,
      _deleted: deleted,
      ...fields,
    });

    this._compact();
  }

  async applyPatch({ baseRev, storageRev, records }, merge) {
    const currentRev = this.getRev();
    if (currentRev !== baseRev) {
      throw new Error(`Got rev ${baseRev} instead of ${currentRev}`);
    }

    const currentRecords = array2object(this._storage.getRecords(), record => record._id);
    const newRecords = records.map(item => isString(item) ? currentRecords[item] : item);

    // for each local record
    for (const localRecord of this._storage.getLocalRecords()) {
      const existingRecord = currentRecords[localRecord._id];
      const newRecord = findById(newRecords, localRecord._id);

      // if is existing record & revision changed
      //   merge
      if (existingRecord._rev !== newRecord._rev) {
        this._storage.addLocalRecord(await merge(existingRecord, newRecord, localRecord));
      }
    }

    // for each local record
    //   if references deleted record
    //     restore deleted record & all deleted records referenced by it
    const idsToCheck = flatten(this._storage.getLocalRecords().map(item => item._refs || []));
    const idsChecked = new Set();
    while (idsToCheck.length) {
      const id = idsToCheck.shift();

      if (idsChecked.has(id)) continue;

      const existingRecord = currentRecords[id];
      const newRecord = findById(newRecords, id);
      if (existingRecord && !newRecord) {
        if (existingRecord._attachment) {
          logger.warn(`Can't restore attachment ${id}, skipping`);
        } else {
          logger.info(`Restoring record ${id}`);
          this._storage.addLocalRecord(existingRecord); // restore record
          idsToCheck.push(...existingRecord._refs);
        }
      }

      idsChecked.add(id);
    }

    // merge patch
    this._storage.setRecords(storageRev, newRecords);
  }

  /**
   * Remove unused local attachments
   */
  _compact() {
    const idsInUse = new Set();
    const attachmentIds = new Set();
    for (const record of this._storage.getLocalRecords()) {
      if (record._attachment) {
        attachmentIds.add(record._id);
      } else {
        record._refs.forEach(id => idsInUse.add(id));
      }
    }

    for (const id of attachmentIds) {
      // remove *new* local attachments
      if (!idsInUse.has(id) && this._storage.getLocalAttachmentUrl(id)) {
        logger.info(`Removing unused local attachment ${id}`);
        this._storage.removeLocalRecord(id);
      }
    }
  }
}
