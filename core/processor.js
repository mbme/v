import log from 'shared/log';
import createQueue from 'core/utils/queue';
import createCoreStore from './stores/core';
import createNotesStore from './stores/notes';
import createTracksStore from './stores/tracks';
import createStorage from './storage';

export default async function createProcessor({ rootDir }) {
  const queue = createQueue();
  const storage = await createStorage(rootDir);
  const stores = [
    createCoreStore(storage),
    createNotesStore(storage),
    createTracksStore(storage),
  ];

  return {
    processAction({ action: { name, data = {} }, files = [] }) {
      for (const store of stores) {
        if (store[name]) {
          return queue.push(async () => {
            log.info('processor: action %s', name);
            return store[name](data, files);
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
