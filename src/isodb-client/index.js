import createPubSub from '../utils/pubsub';
import { createProxy } from '../utils';

const MUTATING_METHODS = [
  'addAttachment',
  'updateAttachment',
  'addRecord',
  'updateRecord',
  'applyPatch',
];

export default class IsodbClient {
  synced = false;
  online = false;

  constructor(replica) {
    this.events = createPubSub();
    this._replica = createProxy(replica, prop => (...params) => {
      return replica[prop](...params);
    });
  }
}
