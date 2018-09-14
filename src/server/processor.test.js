import fs from 'fs';
import path from 'path';
import { test, before, after } from '../tester';
import { createLink } from '../v-parser';
import { createArray } from '../utils';
import { sha256, readStream } from '../utils/node';
import { rmrfSync } from '../fs/utils';
import createProcessor from './processor';
import apiProxy from './api-proxy';

let processor;
let api;
const rootDir = '/tmp/api-client-test-storage';

const init = async () => {
  processor = await createProcessor({ rootDir });
  api = apiProxy(processor.processAction);
};

before(async () => {
  await init();
});

after(() => {
  rmrfSync(rootDir);
  return processor.close();
});

test('should ping', async (assert) => {
  const response = await api.PING();
  assert.equal(response, 'PONG');
});

test('should manage files', async (assert) => {
  const buffer = Buffer.from('test file content');
  const fileId = sha256(buffer);
  const link = createLink('', fileId);

  const note = await api.CREATE_NOTE({ name: 'name', data: `data ${link}` }, [ buffer ]);
  const result = await readStream((await api.READ_ASSET({ id: fileId })).stream);
  assert.equal(buffer.equals(result), true);

  await api.UPDATE_NOTE({ id: note.id, name: 'name', data: 'data' });
  assert.equal(await api.READ_ASSET({ id: fileId }), null);
});

test('should read file metadata', async (assert) => {
  const buffer = await fs.promises.readFile(path.resolve(__dirname, '../../resources/track.mp3'));
  const fileId = sha256(buffer);
  const link = createLink('', fileId);

  const note = await api.CREATE_NOTE({ name: 'name', data: `data ${link}` }, [ buffer ]);
  const { meta } = note.files[0];
  assert.equal(meta.bitRate, 112000);
  assert.equal(meta.duration, 178.573);
});

test('should apply pagination', async (assert) => {
  await Promise.all(createArray(10, () => api.CREATE_NOTE({ name: 'pagination-name', data: 'data' })));

  {
    const result = await api.LIST_NOTES({ skip: 1, size: 9, filter: 'pagination-name' });
    assert.equal(result.items.length, 9);
    assert.equal(result.total, 10);
  }
  {
    const result = await api.LIST_NOTES({ skip: 1, size: 0, filter: 'pagination-name' });
    assert.equal(result.items.length, 9);
    assert.equal(result.total, 10);
  }
  {
    const result = await api.LIST_NOTES({ skip: 0, size: 0, filter: 'pagination-name' });
    assert.equal(result.items.length, 10);
    assert.equal(result.total, 10);
  }
});

test('should manage notes', async (assert) => {
  // create note
  const note = await api.CREATE_NOTE({ name: 'name', data: 'some data' });

  // list notes
  const notes = (await api.LIST_NOTES({ size: 0 })).items;
  await api.CREATE_NOTE({ name: 'name', data: 'some data' });
  const newNotes = (await api.LIST_NOTES({ size: 0 })).items;
  assert.equal(newNotes.length, notes.length + 1);

  // update note
  const updatedNote = await api.UPDATE_NOTE({ id: note.id, name: 'new name', data: 'new data' });
  assert.equal(updatedNote.fields.name, 'new name');
  assert.equal(updatedNote.fields.data, 'new data');
  assert.equal(updatedNote.updatedTs > note.updatedTs, true);

  // delete note
  await api.DELETE_NOTE({ id: note.id });
  assert.equal((await api.LIST_NOTES({ size: 0 })).items.filter(n => n.id === note.id).length, 0);
});

test('should return an error', async (assert) => {
  try {
    await api.UPDATE_NOTE({ id: 99999999, name: 'new name', data: 'new data' });
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

  const note = await api.CREATE_NOTE({ name: 'name', data: `data ${link}` }, [ buffer ]);

  // reinitialize
  await processor.close();
  await init();

  const result = await readStream((await api.READ_ASSET({ id: fileId })).stream);
  assert.equal(buffer.equals(result), true);

  const noteAfterRestart = await api.READ_NOTE({ id: note.id });
  assert.equal(noteAfterRestart.fields.name, note.fields.name);
  assert.equal(noteAfterRestart.fields.data, note.fields.data);
});
