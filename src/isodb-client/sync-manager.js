import {
  fetchPatch,
  pushChanges,
} from './api';

// TODO logs
export default class SyncManager {
  constructor(replica, lockManager) {
    this._replica = replica;
    this._lockManager = lockManager;
  }

  _merge = async (baseRecord, newBaseRecord, localRecord) => {
    // FIXME implement merge
    return localRecord;
  };

  async _fetchPatch() {
    const {
      baseRev,
      storageRev,
      records,
    } = await fetchPatch(this._replica.getRev());

    await this._replica.applyPatch({
      baseRev,
      storageRev,
      records,
    }, this._merge);
  }

  // returns bool
  async _pushChanges() {
    const {
      rev,
      records,
      newAttachments,
    } = this._replica.getChanges();

    const result = await pushChanges(
      rev,
      records,
      newAttachments,
    );
    if (!result.success) {
      // log something
      return false;
    }
    // FIXME approve local changes, then fetch patch from the server
    this._replica.approveChanges();
    return true;
  }

  async _sync() {
    while (!await this._pushChanges()) {
      await this._fetchPatch();
    }
  }


  start() {
    // schedule sync once per minute
  }
  stop() {}
}
