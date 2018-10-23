import { findById } from './utils';
import { randomId } from '../randomizer';

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
    return this._storage.getLocalAttachmentUrl(id)
      || this._storage.getAttachmentUrl(id);
  }

  /**
   * @param {string} id record id
   * @returns {Record?}
   */
  getRecord(id) {
    return findById(this._storage.getLocalRecords(), id)
      || findById(this._storage.getRecords(), id);
  }

  /**
   * @param {string} id sha256 of file content
   * @param {File} blob file content
   */
  addAttachment(id, blob) {
    // FIXME in transaction
    this._storage.addLocalRecord({
      _id: id,
      _attachment: true,
    }, blob);
  }

  /**
   * @param {Object} fields key-value object with fields
   * @param {[string]} refs record's refs
   */
  addRecord(fields, refs) {
    this._storage.addLocalRecord({
      _id: getRandomId(),
      _refs: refs,
      ...fields,
    });
  }

  /**
   * @param {string} id record id
   * @param {Object} fields key-value object with changed fields
   * @param {[string]} refs? new refs (not used if record is attachment)
   */
  updateRecord(id, fields, refs) {
    const record = this.getRecord(id);
    if (!record) throw new Error(`can't update record ${id}: doesn't exist`);

    this._storage.addLocalRecord({
      _id: id,
      ...(record._attachment ? {} : { _refs: refs }),
      // do not pass through _deleted for auto-revive
      ...fields,
    });
  }

  /**
   * @param {string} id record id
   */
  deleteRecord(id) {
    const record = this.getRecord(id);
    if (!record) throw new Error(`can't delete record ${id}: doesn't exist`);

    this._storage.addLocalRecord({
      ...record,
      _deleted: true,
    });
  }

  // TODO resolve conflicts
  async applyChanges(rev, changes) {
    if (this._storage.getRev() >= rev) {
      throw new Error(`Got stale revision ${rev} for storage ${this._storage.getRev()}`);
    }

    if (!changes.length) return;

    
  }

  /**
   * Remove unused local attachments
   */
  compact() {
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
      if (!idsInUse.has(id) && this._storage.getLocalAttachment(id)) {
        this._storage.removeLocalRecord(id);
      }
    }
  }
}
