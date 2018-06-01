import { assertAll } from 'core/validator';

export default function createQueue() {
  let immediateId = null;
  let onClose = null;
  const queue = [];

  async function processQueue() {
    while (queue.length) {
      const action = queue.shift();
      await action().catch(e => console.error('queued action failed', e));
    }
    immediateId = null;
    if (onClose) onClose();
  }

  const runQueue = () => {
    if (!immediateId) immediateId = setImmediate(processQueue);
  };

  return {
    push(action) {
      assertAll([ action, 'async-function' ]);

      return new Promise((resolve, reject) => {
        if (onClose) throw new Error('closing has been closed');

        queue.push(() => action().then(resolve, reject));
        runQueue();
      });
    },

    close(cb) {
      onClose = cb;
      runQueue();
    },
  };
}
