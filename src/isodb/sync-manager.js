// TODO logs
export default class SyncManager {
  constructor(replica, api) {
    this._replica = replica;
    this._api = api;
  }

  _merge = async (baseRecord, newBaseRecord, localRecord) => {
    // FIXME implement merge
    return localRecord;
  };

  async _fetchAll() {
    const {
      baseRev,
      storageRev,
      records,
    } = await this._api.fetchPatch(this._replica.getRev());

    await this._replica.applyPatch({
      baseRev,
      storageRev,
      records,
    }, this._merge);
  }

  // returns bool
  _pushChanges() {
    const {
      rev,
      records,
      newAttachments,
    } = this._replica.getChanges();

    return this._api.pushChanges(
      rev,
      records,
      newAttachments,
    );
  }

  async sync() {
    while (!await this._pushChanges()) {
      await this._fetchAll();
    }
  }
}
