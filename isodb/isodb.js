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
  _id: 'md5',
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

class Client {
  _orig = []; // max_rev
  _patched = []; // max_local_rev
  _new_attachments = [];

  _getMaxRev() {
    return this._orig.reduce((maxRev, item) => item._rev > maxRev ? item._rev : maxRev, 0);
  }

  _fetchAll(rev) {}
  _pushChanges(rev) {}
  _extractPatch() {} // out of _orig & _patched

  sync() {

  }
}

class Server {
  _items = []; // max_rev

  // []id|item
  getAll(rev) {
    return this._items.map(item => item._rev > rev ? item : item._id);
  }

  // patches: []patch
  applyPatch(patches) {}

  compact() {}
}
