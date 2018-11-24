import { createLogger } from '../logger';
import startServer from './index';
import PrimaryDB from '../isodb/primary';
import InMemStorage from '../isodb/primary-in-mem-storage';
import { getFakeNotes } from '../randomizer/faker';

const log = createLogger('isodb-server');

const isProduction = process.env.NODE_ENV === 'production';

export default async function run(port, password, rootDir, ...args) {
  if (!port || !password || !rootDir) throw new Error('port, password & rootDir are required');

  const db = new PrimaryDB(new InMemStorage());
  if (!isProduction && args.includes('--gen-data')) {
    const {
      records,
      attachments,
    } = await getFakeNotes(30);
    db.applyChanges(0, records, attachments);
    log.info(`Generated ${records.length} fake notes`);
  }

  const server = await startServer(db, port, password);

  log.info(`listening on http://localhost:${port}`);

  async function close() {
    log.debug('stopping...');
    try {
      await server.stop();
      process.exit(0);
    } catch (e) {
      log.error('failed to stop', e);
      process.exit(1);
    }
  }

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}
