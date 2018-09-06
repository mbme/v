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

class Client {
  _storage = null;
  _api = null;

  constructor(storage, api) {
    this._storage = storage;
    this._api = api;
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
