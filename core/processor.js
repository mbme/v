import createQueue from 'core/utils/queue';
import createStorage from './storage';
import actions from './actions';

export default async function createProcessor({ rootDir }) {
  const queue = createQueue();
  const storage = await createStorage(rootDir);

  return {
    processAction({ action: { name, data = {} }, files = [] }) {
      const action = actions[name];
      if (!action) throw new Error(`unknown action: ${name}`);

      return queue.push(async () => {
        console.log('processing action %s', name);
        return action(storage, data, files);
      });
    },

    close() {
      return queue.close();
    },
  };
}
