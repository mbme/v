// no revision tree:
// client forms PATCH and fetches changes from master before pushing
// (and retries until everything works)
// so it doesn't matter how many time client updated record - there would be single revision
{
  _id: 'id',
  _rev: '2-xfa2323zx2',
  _conflicts: ['2-asdfasdfasd', '2-322sdfas'],
  _deleted: true,
  _attachments: [],
}

export function createClient() {
  // autosync
  return {
    sync() {},
  }
}

export function createMaster() { // the single source of trust

}
