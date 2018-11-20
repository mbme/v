import createPubSub from '../utils/pubsub';

export default class ReplicaInMemStorage {
  _records = [];
  _rev = 0;

  _localRecords = {};
  _localAttachments = {};

  events = createPubSub();

  getRev() {
    return this._rev;
  }

  getRecords() {
    return this._records.slice(0);
  }

  setRecords(rev, records) {
    this._rev = rev;
    this._records = records;
    this.events.emit('update');
  }

  getLocalRecords() {
    return Object.values(this._localRecords);
  }

  getLocalAttachments() {
    return {
      ...this._localAttachments,
    };
  }

  // add or update existing local record
  addLocalRecord(record, blob) {
    this._localRecords[record._id] = record;
    if (blob) {
      this._localAttachments[record._id] = blob;
    }
    this.events.emit('update');
  }

  removeLocalRecord(id) {
    delete this._localRecords[id];
    delete this._localAttachments[id];
    this.events.emit('update');
  }

  getAttachmentUrl(id) {
    if (this._localAttachments[id]) {
      return `local-attachment-url(${id})`;
    }

    return `attachment-url(${id})`;
  }

  clearLocalRecords() {
    this._localRecords = {};
    this._localAttachments = {};
    this.events.emit('update');
  }
}
