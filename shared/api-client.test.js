import path from 'path';
import { test, before, after } from 'tools/test';
import startServer from 'server';
import createNetwork from 'server/utils/platform';
import { createLink } from 'shared/parser';
import { sha256, rmrfSync, readFile } from 'server/utils';
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

  const failed = await badApi.listNotes().then(() => false, () => true);
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

  const note = await api.createNote('name', `data ${link}`, [ buffer ]);
  assert.equal(buffer.equals(await api.readFile(fileId)), true);

  await api.updateNote(note.id, 'name', 'data');
  assert.equal(await api.readFile(fileId), null);
});

test('should read file metadata', async (assert) => {
  const buffer = await readFile(path.resolve(__dirname, '../resources/track.mp3'));
  const fileId = sha256(buffer);
  const link = createLink('', fileId);

  const note = await api.createNote('name', `data ${link}`, [ buffer ]);
  const { meta } = note.files[0];
  assert.equal(meta.bitRate, 112000);
  assert.equal(meta.duration, 178.573);
});

test('should manage notes', async (assert) => {
  // create note
  const note = await api.createNote('name', 'some data');

  // list notes
  const notes = await api.listNotes();
  await api.createNote('name', 'some data');
  const newNotes = await api.listNotes();
  assert.equal(newNotes.length, notes.length + 1);

  // update note
  const updatedNote = await api.updateNote(note.id, 'new name', 'new data');
  assert.equal(updatedNote.fields.name, 'new name');
  assert.equal(updatedNote.fields.data, 'new data');
  assert.equal(updatedNote.updatedTs > note.updatedTs, true);

  // delete note
  await api.deleteNote(note.id);
  assert.equal((await api.listNotes()).filter(n => n.id === note.id).length, 0);
});

test('should return an error', async (assert) => {
  try {
    await api.updateNote(99999999, 'new name', 'new data');
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

  const note = await api.createNote('name', `data ${link}`, [ buffer ]);

  await server.close();
  server = await runServer();

  assert.equal(buffer.equals(await api.readFile(fileId)), true);

  const noteAfterRestart = await api.readNote(note.id);
  assert.equal(noteAfterRestart.fields.name, note.fields.name);
  assert.equal(noteAfterRestart.fields.data, note.fields.data);
});
