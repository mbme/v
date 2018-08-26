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
  _rev = 0;
  _localRev = 0;

  _fetchAll(rev) {}
  _pushChanges(rev) {}
  _extractPatch() {}

  sync() {

  }
}

class Server {
  _rev = 0;

  getAll(rev) {}

  // patches: []patch
  applyPatch(patches) {}
}
