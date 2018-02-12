import { test, before, after } from 'tools/test';
import startServer from 'server';
import createNetwork from 'server/platform';
import { createLink } from 'shared/parser';
import { sha256, rmrfSync } from 'server/utils';
import createApiClient from './api-client';

let server;
let api;
const port = 8079;
const rootDir = '/tmp/api-client-test-storage';
const password = 'test';

const runServer = () => startServer(port, { html5historyFallback: false, requestLogger: false, rootDir, password });

before(async () => {
  server = await runServer();
  api = createApiClient(`http://localhost:${port}`, createNetwork(password));
});

after(() => {
  rmrfSync(rootDir);
  return server.close();
});

test('should handle auth', async (assert) => {
  const badApi = createApiClient(`http://localhost:${port}`, createNetwork('wrong password'));

  const failed = await badApi.listRecords('note').then(() => false, () => true);
  assert.equal(failed, true);
});

test('should ping', async (assert) => {
  const response = await api.ping();
  assert.equal(response, 'PONG');
});

test('should manage files', async (assert) => {
  const buffer = Buffer.from('test file content');
  const fileId = sha256(buffer);
  const link = createLink('', fileId);

  const record = await api.createRecord('note', 'name', `data ${link}`, [ buffer ]);
  assert.equal(buffer.equals(await api.readFile(fileId)), true);

  await api.updateRecord(record.id, 'name', 'data');
  assert.equal(await api.readFile(fileId), null);
});

test('should manage records', async (assert) => {
  // create record
  const record = await api.createRecord('note', 'name', 'some data');

  // list records
  const records = await api.listRecords('note');
  await api.createRecord('note', 'name', 'some data');
  const newRecords = await api.listRecords('note');
  assert.equal(newRecords.length, records.length + 1);

  // update record
  const updatedRecord = await api.updateRecord(record.id, 'new name', 'new data');
  assert.equal(updatedRecord.name, 'new name');
  assert.equal(updatedRecord.data, 'new data');
  assert.equal(updatedRecord.updatedTs > record.updatedTs, true);

  // delete record
  await api.deleteRecord(record.id);
  assert.equal((await api.listRecords('note')).filter(rec => rec.id === record.id).length, 0);
});

test('should return an error', async (assert) => {
  try {
    await api.updateRecord(99999999, 'new name', 'new data');
  } catch (e) {
    assert.equal(!!e, true);
    return;
  }
  throw new Error('must be unreachable');
});

test('should properly initialize', async (assert) => {
  const buffer = Buffer.from('test file content');
  const fileId = sha256(buffer);
  const link = createLink('', fileId);

  const record = await api.createRecord('note', 'name', `data ${link}`, [ buffer ]);

  await server.close();
  server = await runServer();

  assert.equal(buffer.equals(await api.readFile(fileId)), true);

  const recordAfterRestart = await api.readRecord(record.id);
  assert.equal(recordAfterRestart.name, record.name);
  assert.equal(recordAfterRestart.data, record.data);
});
