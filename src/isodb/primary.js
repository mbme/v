import { assert } from '../asserts';
import { findById } from './utils';

export default class PrimaryDB {
  _storage = null;

  constructor(storage) {
    this._storage = storage;
  }

  /**
   * @param {number} [rev] minimum revision to include
   * @returns {[string|Record]} array of record if _id is >= rev, id otherwise
   */
  getAll(rev = 0) {
    const currentRev = this.getRev();
    if (rev > currentRev) {
      throw new Error(`Got request for the future rev ${rev}, current rev is ${currentRev}`);
    }

    return this._storage.getRecords().map(item => item._rev >= rev ? item : item._id);
  }

  /**
   * @returns {number} storage revision
   */
  getRev() {
    return this._storage.getRev();
  }

  /**
   * @param {string} id record id
   * @returns {Record?}
   */
  getRecord(id) {
    assert(id, 'string');
    return findById(this._storage.getRecords(), id);
  }

  /**
   * @param {string} id attachment id
   * @returns {string?} path to attachment
   */
  getAttachment(id) {
    assert(id, 'string');
    return this._storage.getAttachment(id);
  }

  getPatch(rev = 0) {
    return {
      baseRev: rev,
      storageRev: this.getRev(),
      records: this.getAll(rev),
    };
  }

  /**
   * @param {number} rev client's storage revision
   * @param {[Record]} records new or updated records
   * @param {Object<String, String>} [newAttachments] id -> path map of new attachments
   * @returns {boolean}
   */
  applyChanges(rev, records, newAttachments = {}) { // FIXME cleanup attachments
    if (this._storage.getRev() !== rev) { // ensure client had latest revision
      return false;
    }

    if (!records.length) { // skip empty changesets
      return true;
    }

    const newRev = rev + 1;

    for (const changedRecord of records) {
      changedRecord._rev = newRev;

      const attachment = newAttachments[changedRecord._id];
      const existingRecord = this.getRecord(changedRecord._id);

      if (existingRecord && existingRecord._attachment !== changedRecord._attachment) {
        throw new Error(`Can't change _attachment status for the record ${changedRecord._id}`);
      }

      if (existingRecord && existingRecord._attachment && attachment) {
        throw new Error(`Can't replace attachment for the record ${changedRecord._id}`);
      }

      if (changedRecord._attachment && !attachment) {
        throw new Error(`Missing attachment for the record ${changedRecord._id}`);
      }

      if (!changedRecord._attachment && attachment) {
        throw new Error(`Unexpected attachment for the record ${changedRecord._id}`);
      }

      this._storage.putRecord(changedRecord, attachment);
    }

    this._storage.setRev(newRev);

    return true;
  }

  /**
   * Physically remove orphan deleted records & orphan attachments.
   */
  compact() {
    const records = this._storage.getRecords();

    const validIds = new Set(
      records.filter(item => !item._attachment && !item._deleted).map(item => item._id)
    );

    const idsToCheck = Array.from(validIds);
    const idsChecked = new Set();
    while (idsToCheck.length) {
      const record = findById(records, idsToCheck[0]);

      for (const id of (record._refs || [])) {
        if (validIds.has(id)) {
          continue;
        }

        if (!record._deleted) {
          validIds.add(id);
        }

        if (!idsToCheck.includes(id) && !idsChecked.has(id)) {
          idsToCheck.push(id);
        }
      }

      idsChecked.add(idsToCheck.shift()); // pop first item
    }

    let removedRecords = 0;
    let removedAttachments = 0;

    for (const record of records) {
      if (validIds.has(record._id)) {
        continue;
      }

      if (record._attachment) {
        removedAttachments += 1;
      } else {
        removedRecords += 1;
      }
      this._storage.removeRecord(record._id); // FIXME in transaction
    }

    if (removedRecords + removedAttachments) { // update revision if there were any changes
      this._storage.setRev(this._storage.getRev() + 1);
      // TODO log numbers
    }
  }
}
