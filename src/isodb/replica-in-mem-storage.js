import { findById } from './utils';

export default class ReplicaInMemStorage {
  _records = [];
  _rev = 0;

  _localRecords = {};
  _localAttachments = {};

  getRev() {
    return this._rev;
  }

  getRecords() {
    return this._records.slice(0);
  }

  setRecords(rev, records) {
    this._rev = rev;
    this._records = records;
  }

  getLocalRecords() {
    return Object.values(this._localRecords);
  }

  // add or update existing local record
  addLocalRecord(record, blob) {
    this._localRecords[record._id] = record;
    if (blob) {
      this._localAttachments[record._id] = blob;
    }
  }

  removeLocalRecord(id) {
    delete this._localRecords[id];
    delete this._localAttachments[id];
  }

  getAttachmentUrl(id) {
    const record = findById(this._records, id);

    if (record && record._attachment) {
      return `attachment-url(${id})`;
    }

    return null;
  }

  getLocalAttachmentUrl(id) {
    if (this._localAttachments[id]) {
      return `local-attachment-url(${id})`;
    }

    return null;
  }
}
