import { findById } from './utils';

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

class ReplicaDB {
  _storage = null;
  _api = null;

  constructor(storage, api) {
    this._storage = storage;
    this._api = api;
  }

  getAttachmentUrl(id) {}

  getRecord(id) {
    return findById(this._storage.getLocalRecords(), id)
      || findById(this._storage.getRecords(), id);
  }

  addAttachment(id, blob) {
    // FIXME in transaction
    this._storage.addLocalRecord({
      _id: id,
      _attachment: true,
    });
    this._storage.addLocalAttachment(id, blob);
  }

  addRecord(fields, refs) {
    const id = this._genRandomId();
    this._storage.addLocalRecord({
      _id: id,
      _refs: refs,
      ...fields,
    });
  }

  updateRecord(id, fields, refs) {
    const record = this.getRecord(id);
    if (!record) {
      throw new Error(`can't update record ${id}: doesn't exist`);
    }
    this._storage.addLocalRecord({
      _id: id,
      _refs: refs,
      // do not pass through _deleted for auto-revive
      ...fields,
    });

    this._compact();
  }

  deleteRecord(id) {
    const record = this.getRecord(id);
    if (!record) {
      throw new Error(`can't delete record ${id}: doesn't exist`);
    }
    this._storage.addLocalRecord({
      ...record,
      _deleted: true,
    });
  }

  _genRandomId() {}

  _compact() {
    // compact local attachments
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
      if (!idsInUse.has(id) && this._storage.localAttachmentExists(id)) {
        this._storage.removeLocalRecord(id);
      }
    }
  }

  _fetchAll() {
    const {
      records,
      rev,
    } = this._api.fetchAll(this._storage.getRev());
    // TODO resolve conflicts
  }

  // returns bool
  _pushChanges() {
    return this._api.pushChanges(
      this._storage.getRev(),
      this._storage.getLocalRecords(),
      this._storage.getLocalAttachments(),
    );
  }

  sync() {
    while (!this._pushChanges()) {
      this._fetchAll();
    }
  }
}
