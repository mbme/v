import log from '../logger';
import createQueue from '../utils/queue';

export default async function createProcessor(db) {
  const queue = createQueue();

  return {
    readAsset(id) {
      return queue.push(async () => {

      });
    },

    getPatch(rev) {
      return queue.push(() => db.getPatch(rev));
    },

    applyChanges(rev, records, assets) {
      return queue.push(() => db.applyChanges(rev, records, assets));
    },

    close() {
      return queue.close();
    },
  };
}
