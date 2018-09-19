export default class InMemStorage {
  _records = [];
  _rev = 0;
  _attachments = {};

  getRecords() {
    return this._records;
  }

  getRev() {
    return this._rev;
  }

  setRev(rev) {
    this._rev = rev;
  }

  getAttachment(id) {
    return this._attachments[id];
  }

  putRecord(record, attachment) {
    this.removeRecord(record._id);
    this._records.push(record);
    this._attachments[record._id] = attachment;
  }

  removeRecord(id) {
    const pos = this._records.findIndex(item => item._id === id);
    if (pos > -1) {
      this._records.splice(pos, 1);
    }
  }
}
