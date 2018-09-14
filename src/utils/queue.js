import log from '../logger';
import { assertAll } from '../asserts';

const scheduleTask = global.setImmediate || (task => setTimeout(task, 0));

export default function createQueue() {
  let _taskId = null;
  let _onClose = null;
  const _queue = [];

  async function processQueue() {
    while (_queue.length) {
      const action = _queue.shift();
      await action().catch(e => log.error('queued action failed', e));
    }
    _taskId = null;
    if (_onClose) _onClose();
  }

  const scheduleQueueProcessing = () => {
    if (!_taskId) {
      _taskId = scheduleTask(processQueue);
    }
  };

  return {
    push(action) {
      assertAll([ action, 'async-function' ]);

      return new Promise((resolve, reject) => {
        if (_onClose) throw new Error('queue has been closed');

        _queue.push(() => action().then(resolve, reject));
        scheduleQueueProcessing();
      });
    },

    close() {
      return new Promise((resolve) => {
        _onClose = resolve;
        scheduleQueueProcessing();
      });
    },
  };
}
