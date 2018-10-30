/* eslint-disable no-console */
import { format as formatDate } from 'date-fns';

const LEVEL = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const PRIORITY = {
  [LEVEL.DEBUG]: 0,
  [LEVEL.INFO]: 1,
  [LEVEL.WARN]: 2,
  [LEVEL.ERROR]: 3,
};

const minLogLevel = process.env.LOG || LEVEL.INFO;
if (!Object.values(LEVEL).includes(minLogLevel)) throw new Error(`Illegal log level ${minLogLevel}`);

function createLevelLogger(level, namespace) {
  const method = level.toLowerCase();
  const name = level.padEnd(5);

  return (...params) => {
    if (PRIORITY[level] >= PRIORITY[minLogLevel]) {
      console[method](`${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss,SSS')} ${namespace ? `[${namespace}]` : ''} ${name}`, ...params);
    }
  };
}

export function createLogger(namespace) {
  return {
    debug: createLevelLogger(LEVEL.DEBUG, namespace),
    info: createLevelLogger(LEVEL.INFO, namespace),
    warn: createLevelLogger(LEVEL.WARN, namespace),
    error: createLevelLogger(LEVEL.ERROR, namespace),

    simple(...params) {
      console.log(...params);
    },
  };
}

export default createLogger('');
