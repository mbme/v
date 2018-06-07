import log from 'core/utils/log';
import { assertAll } from 'core/validator';

export default function createQueue() {
  let immediateId = null;
  let onClose = null;
  const queue = [];

  async function processQueue() {
    while (queue.length) {
      const action = queue.shift();
      await action().catch(e => log.error('queued action failed', e));
    }
    immediateId = null;
    if (onClose) onClose();
  }

  const scheduleQueueProcessing = () => {
    if (!immediateId) immediateId = setImmediate(processQueue);
  };

  return {
    push(action) {
      assertAll([ action, 'async-function' ]);

      return new Promise((resolve, reject) => {
        if (onClose) throw new Error('queue has been closed');

        queue.push(() => action().then(resolve, reject));
        scheduleQueueProcessing();
      });
    },

    close() {
      return new Promise((resolve) => {
        onClose = resolve;
        scheduleQueueProcessing();
      });
    },
  };
}
