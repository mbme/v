// no revision tree:
// client forms PATCH and fetches changes from master before pushing
// (and retries until everything works)
// so it doesn't matter how many time client updated record - there would be single revision
{ // record
  _id: 'zdfw234d2',
  _rev: 2, // autoincrement
  _refs: ['asdfsad'],
  _deleted: true,
  name: 'test',
  data: 'x1',
}
{ // attachment
  _id: 'md5-2131321',
  _rev: 2, // autoincrement
  _deleted: true,
  _attachment: true,
  size: 10,
}
{ // patch
  _id: 'md5',
  _rev: 2, // autoincrement
  _deleted: true,
  size: 10,
}

const getMaxRev = (maxRev, item) => item._rev > maxRev ? item._rev : maxRev;

class Client {
  _storage = null;
  _api = null;

  constructor(storage, api) {
    this._storage = storage;
    this._api = api;
  }

  _getMaxRev() {
    return this._storage.getRecords().reduce(getMaxRev, 0);
  }

  _fetchAll() {
    const records = this._api.fetchAll(this._getMaxRev());
    // TODO resolve conflicts
  }

  // returns bool
  _pushChanges() {
    return this._api.pushChanges(
      this._getMaxRev(),
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

class Server {
  _storage = null;

  constructor(storage) {
    this._storage = storage;
  }

  // []id|item
  getAll(rev) {
    return this._storage.getRecords().map(item => item._rev > rev ? item : item._id);
  }

  getRecord(id) {
    return this._storage.getRecords().find(item => item._id === id);
  }

  getAttachment(id) {
    return this._storage.getAttachment(id);
  }

  // patches: []patch
  applyChanges(changes) {}

  compact() {}
}
