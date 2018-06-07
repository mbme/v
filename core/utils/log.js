import { format as formatDate } from 'date-fns';

const LEVEL = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const PRIORITY = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const minLogLevel = process.env.LOG || LEVEL.INFO;
if (!Object.values(LEVEL).includes(minLogLevel)) throw new Error(`Illegal log level ${minLogLevel}`);

function log(lvlname, level, msg, ...params) {
  if (PRIORITY[level] >= PRIORITY[minLogLevel]) {
    // eslint-disable-next-line no-console
    console[lvlname](`${formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss,SSS')} ${level.padEnd(5)} ${msg}`, ...params);
  }
}

export default {
  debug(...params) {
    log('debug', LEVEL.DEBUG, ...params);
  },
  info(...params) {
    log('info', LEVEL.INFO, ...params);
  },
  warn(...params) {
    log('warn', LEVEL.WARN, ...params);
  },
  error(...params) {
    log('error', LEVEL.ERROR, ...params);
  },
};
