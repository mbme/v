import IsodbReplica from '../isodb/replica';
import ReplicaInMemStorage from '../isodb/replica-in-mem-storage';
import createPubSub from '../utils/pubsub';
import LockManager from './lock-manager';
import SyncManager from './sync-manager';

export default class IsodbClient {
  events = createPubSub();

  constructor() {
    this._storage = new ReplicaInMemStorage();
    this._storage.events.on('update', this._onUpdate);

    this._db = new IsodbReplica(this._storage);
    this._lockManager = new LockManager();

    this._syncManager = new SyncManager(this._db, this._lockManager);
    this._syncManager.start();
  }

  _onUpdate = () => {
    this.events.emit('update');
  };

  lockRecord(id) {
    return this._lockManager.lockRecord(id);
  }

  destroy() {
    this._storage.events.off('update', this._onUpdate);
    this._syncManager.stop();
  }
}
