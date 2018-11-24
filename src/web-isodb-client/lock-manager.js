// FIXME implement through the SharedWorker
export default class LockManager {
  async lockDB(timeoutSec = 30) {
    return () => this._unlockDB();
  }
  _unlockDB() {}

  // lock request would be rejected in timeoutSec seconds
  async lockRecord(id, timeoutSec = 30) {
    return () => this._unlockRecord(id);
  }
  unlockRecord(id) {}
}
