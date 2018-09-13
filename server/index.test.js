import { test, before, after } from '../tester';
import startServer from './index';
import { rmrfSync } from '../fs/utils';
import createApiClient from './api-client';

let server;
const port = 8079;
const url = `http://localhost:${port}`;
const rootDir = '/tmp/api-client-test-storage';
const password = 'test';

const runServer = () => startServer(port, { html5historyFallback: false, rootDir, password });

before(async () => {
  server = await runServer();
});

after(() => {
  rmrfSync(rootDir);
  return server.close();
});

test('should fail with invalid password', async (assert) => {
  const api = createApiClient(url, 'wrong password');

  const failed = await api.LIST_NOTES().then(() => false, () => true);
  assert.equal(failed, true);
});

test('should pass with valid password', async (assert) => {
  const api = createApiClient(url, password);

  const failed = await api.LIST_NOTES().then(() => false, () => true);
  assert.equal(failed, false);
});
