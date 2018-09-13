import fs from 'fs';
import path from 'path';
import { test, before, after } from '../tester';
import { createTempDir, rmrfSync, writeText, readText } from './utils';
import createFsTransaction from './transaction';

let tmpDir;
let counter = 0;
before(async () => {
  tmpDir = await createTempDir();
});
after(() => {
  rmrfSync(tmpDir);
});

const getRandomFilePath = () => {
  counter += 1;
  return path.join(tmpDir, counter.toString());
};

test('fails when applying multiple operations to the same file', (assert) => {
  const t = createFsTransaction();
  const file = getRandomFilePath();
  t.addFile(file, {});

  assert.throws(() => t.updateFile(file, {}));
});

test('adding file', async (assert) => {
  const t = createFsTransaction();
  const file = getRandomFilePath();

  t.addFile(file, '');
  await t.commit();

  assert.true(fs.existsSync(file));
});

test('updating file', async (assert) => {
  const t = createFsTransaction();
  const file = getRandomFilePath();

  await writeText(file, '1');

  t.updateFile(file, '2');
  await t.commit();

  assert.equal(await readText(file), '2');
});

test('removing file', async (assert) => {
  const t = createFsTransaction();
  const file = getRandomFilePath();

  await writeText(file, '1');

  t.removeFile(file);
  await t.commit();

  assert.true(!fs.existsSync(file));
});

test('few operations per transaction', async (assert) => {
  const t = createFsTransaction();
  const file1 = getRandomFilePath();
  const file2 = getRandomFilePath();

  await writeText(file2, '1');

  t.addFile(file1, '');
  t.updateFile(file2, '2');
  await t.commit();

  assert.true(fs.existsSync(file1));
  assert.equal(await readText(file2), '2');
});

test('rollback', async (assert) => {
  const t = createFsTransaction();
  const file1 = getRandomFilePath();
  const file2 = getRandomFilePath();
  const file3 = getRandomFilePath();

  await writeText(file1, '1');
  await writeText(file2, '1');
  await writeText(file3, '1');

  t.updateFile(file1, '2');
  t.removeFile(file2);
  t.addFile(file3, '');

  const err = await t.commit().catch(e => e);

  assert.true(!!err);
  assert.equal(await readText(file1), '1');
  assert.equal(await readText(file2), '1');
});
