import log from '../logger';
import createQueue from '../utils/queue';
import createCoreStore from './stores/core';
import createNotesStore from './stores/notes';
import createStorage from './storage';

export default async function createProcessor({ rootDir }) {
  const queue = createQueue();
  const storage = await createStorage(rootDir);
  const stores = [
    createCoreStore(storage),
    createNotesStore(storage),
  ];

  return {
    processAction({ name, data = {} }, assets = []) {
      for (const store of stores) {
        if (store[name]) {
          return queue.push(async () => {
            log.info('processor: action %s', name);
            return store[name](data, assets);
          });
        }
      }

      throw new Error(`unknown action: ${name}`);
    },

    close() {
      return queue.close();
    },
  };
}
