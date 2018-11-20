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

    if (!records.length) {
      return true;
    }

    const result = await pushChanges(
      rev,
      records,
      newAttachments,
    );

    if (!result.success) {
      // FIXME log something
      return false;
    }

    await this._replica.applyPatch({
      baseRev: result.baseRev,
      storageRev: result.storageRev,
      records: result.records,
      ack: true,
    });

    return true;
  }

  async _sync() {
    const unlock = await this._lockManager.lockDB();

    try {
      let tries = 0;
      while (!await this._pushChanges()) {
        if (tries > 2) {
          throw new Error('Failed to sync, try again later');
        }

        await this._fetchPatch();

        tries += 1;
      }
    } finally {
      unlock();
    }
  }


  start() {
    // FIXME schedule sync once per minute
    this._sync();
  }
  stop() {}
}
