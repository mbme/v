/* eslint-disable no-underscore-dangle */

import fs from 'fs';
import assert from 'assert';
import { readJSON, writeJSON } from 'core/utils';
import log from 'core/utils/log';
import { uniq } from 'shared/utils';

let _beforeCb;
let _tests = [];
let _afterCb;

export function collectTests(cb) {
  cb();

  const result = {
    tests: _tests,
    before: _beforeCb,
    after: _afterCb,
  };

  _beforeCb = null;
  _tests = [];
  _afterCb = null;

  return result;
}

export const test = (name, fn, only = false) => _tests.push({ name, fn, only });
export const before = (cb) => { _beforeCb = cb; };
export const after = (cb) => { _afterCb = cb; };

async function runTest({ name, fn }, oldSnapshots, updateSnapshots) {
  let okAsserts = 0;
  let snapshotPos = 0;
  const snapshots = [];

  try {
    await Promise.resolve(fn({
      equal(actual, expected) {
        if (actual === expected) {
          okAsserts += 1;
        } else {
          assert.fail(
            `not ok
            expected:
              ${expected}
            actual:
              ${actual}
          `
          );
        }
      },

      deepEqual(actual, expected) {
        assert.deepStrictEqual(actual, expected);
        okAsserts += 1;
      },

      matchSnapshot(actual) {
        if (snapshotPos < oldSnapshots.length) {
          try {
            assert.equal(
              JSON.stringify(actual, null, 2),
              JSON.stringify(oldSnapshots[snapshotPos], null, 2),
            );
          } catch (e) {
            if (!updateSnapshots) throw e;
            log.simple(`  ${name}: updating snapshot`);
          }
        }

        snapshots.push(actual);
        snapshotPos += 1;
        okAsserts += 1;
      },

      throws(block, error) {
        try {
          block();
          assert.fail('Expected to throw');
        } catch (e) {
          if (error) assert.equal(e, error);
        }
      },
    }));

    log.simple(`  ${name}: ${okAsserts} ok`, snapshotPos ? `/ ${snapshotPos} snapshots` : '');
    return [ snapshots, true ];
  } catch (e) {
    log.simple(`  ${name} failed\n`, e.message);
    log.simple(e.stack);
    return [ oldSnapshots, false ];
  }
}

export async function runTests(file, tests, updateSnapshots) {
  if (uniq(tests, ({ name }) => name).length !== tests.length) {
    throw new Error(`${file} contains tests with similar names`);
  }

  const snapshotsFile = file + '.snap.json';
  const snapshotsFileExists = fs.existsSync(snapshotsFile);
  const oldSnapshots = snapshotsFileExists ? await readJSON(snapshotsFile) : {};

  const newSnapshots = {};
  let failures = 0;

  for (const t of tests) {
    const [ snapshots, success ] = await runTest(t, oldSnapshots[t.name] || [], updateSnapshots);

    if (!success) failures += 1;

    if (snapshots.length) {
      newSnapshots[t.name] = snapshots;
    }
  }

  if (Object.values(newSnapshots).length) {
    await writeJSON(snapshotsFile, newSnapshots);
  } else if (snapshotsFileExists) {
    await fs.promises.unlink(snapshotsFile);
  }

  return failures;
}
