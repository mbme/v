import { findById } from './utils';

export default class PrimaryDB {
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
    return findById(this._storage.getRecords(), id);
  }

  /**
   * @param {string} id attachment id
   * @returns {Stream?}
   */
  getAttachment(id) {
    return this._storage.getAttachment(id);
  }

  /**
   * @param {number} rev client's storage revision
   * @param {[Record]} changes new or updated records
   * @param {[Stream]} newAttachments new attachments
   * @returns {boolean}
   */
  applyChanges(rev, changes, newAttachments) {
    if (this._storage.getRev() !== rev) { // ensure client had latest revision
      return false;
    }

    if (!changes.length) { // skip empty changesets
      return true;
    }

    const newRev = rev + 1;

    for (const changedRecord of changes) {
      changedRecord._rev = newRev;

      if (this._storage.hasRecord(changedRecord._id)) {
        this._storage.updateRecord(changedRecord, newAttachments);
      } else {
        this._storage.addRecord(changedRecord, newAttachments);
      }
    }

    this._storage.setRev(newRev);

    return true;
  }

  /**
   * Physically remove orphan deleted records & orphan attachments.
   */
  compact() {
    const records = this._storage.getRecords();

    const validIds = new Set();
    for (const record of records) {
      if (!record._attachment && !record._deleted) {
        validIds.add(record._id);
      }
    }

    const idsToCheck = Array.from(validIds);
    while (idsToCheck.length) {
      const record = findById(records, idsToCheck[0]);

      for (const id of (record._refs || [])) { // cause attachments has no _refs
        if (validIds.has(id)) {
          continue;
        }

        validIds.add(id);

        if (!idsToCheck.includes(id)) {
          idsToCheck.push(id);
        }
      }

      idsToCheck.shift(); // pop first item
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
      this._storage.removeRecord(record._id);
    }

    if (removedRecords + removedAttachments) { // update revision if there were any changes
      this._storage.setRev(this._storage.getRev() + 1);
    }
  }
}
