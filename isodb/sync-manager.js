export default class SyncManager {
  constructor(replica, api) {
    this._replica = replica;
    this._api = api;
  }

  _fetchAll() {
    const {
      records,
      rev,
    } = this._api.fetchAll(this._replica.getRev());
    this._replica.applyChanges(rev, records);
  }

  // returns bool
  _pushChanges() {
    return this._api.pushChanges(
      this._replica.getRev(),
      this._replica.getLocalRecords(),
      this._replica.getLocalAttachments(),
    );
  }

  sync() {
    while (!this._pushChanges()) {
      this._fetchAll();
    }
  }
}
