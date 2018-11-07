import createQueue from '../utils/queue';

export default function createProcessor(db) {
  const queue = createQueue();

  return {
    getAttachment(id) {
      return queue.push(async () => db.getAttachment(id));
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
