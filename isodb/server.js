import {
  getMaxRev,
} from './utils';
import {
  removeMut,
} from '../shared/utils';

export default class Server {
  _storage = null;

  constructor(storage) {
    this._storage = storage;
  }

  /**
   * @param {number} rev minimum revision to include
   * @returns {[String|Record]} record if _id is >= rev, id otherwise
   */
  getAll(rev) {
    return this._storage.getRecords().map(item => item._rev > rev ? item : item._id);
  }

  /**
   * @param {string} id record id
   * @returns {Record?}
   */
  getRecord(id) {
    return this._storage.getRecords().find(item => item._id === id);
  }

  /**
   * @param {string} id attachment id
   * @returns {Stream?}
   */
  getAttachment(id) {
    return this._storage.getAttachment(id);
  }

  /**
   * @param {number} rev client revision
   * @param {[Record]} changes new or updated records
   * @param {[Stream]} newAttachments new attachments
   * @returns {boolean}
   */
  applyChanges(rev, changes, newAttachments) {
    const records = this._storage.getRecords();
    if (getMaxRev(records) !== rev) { // ensure client had latest revision
      return false;
    }

    for (let i = 0; i < changes.length; i += 1) {
      const changedRecord = changes[i];
      changedRecord._rev = rev + i + 1;

      const existingRecord = records.find(item => item._id === changedRecord._id);
      if (existingRecord) {
        this._storage.updateRecord(changedRecord, newAttachments);
        removeMut(records, existingRecord);
      } else {
        this._storage.addRecord(changedRecord, newAttachments);
      }
    }

    return true;
  }

  /**
   * Physically remove deleted records
   */
  compact() {
    // FIXME deleted records? deleted attachments?
    // what if record with maxRev is removed?
    this._storage.getRecords()
      .filter(item => item._deleted)
      .forEach(item => this._storage.removeRecord(item));
  }
}
