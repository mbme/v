/* eslint-disable no-await-in-loop, no-underscore-dangle */

import fs from 'fs'
import assert from 'assert'
import { readJSON, writeJSON, deleteFile } from 'server/utils'
import { uniq } from 'shared/utils'

let _beforeCb
let _tests = []
let _afterCb

export function collectTests(cb) {
  cb()

  const result = {
    tests: _tests,
    before: _beforeCb,
    after: _afterCb,
  }

  _beforeCb = null
  _tests = []
  _afterCb = null

  return result
}

export const test = (name, fn, only = false) => _tests.push({ name, fn, only })
export const before = (cb) => { _beforeCb = cb }
export const after = (cb) => { _afterCb = cb }

async function runTest({ name, fn }, oldSnapshots) {
  let okAsserts = 0
  let snapshotPos = 0
  const snapshots = []

  try {
    await Promise.resolve(fn({
      equal(actual, expected) {
        if (actual === expected) {
          okAsserts += 1
        } else {
          assert.fail(
            `not ok
            expected:
              ${expected}
            actual:
              ${actual}
          `
          )
        }
      },

      deepEqual(actual, expected) {
        assert.deepStrictEqual(actual, expected)
        okAsserts += 1
      },

      matchSnapshot(actual) {
        if (snapshotPos < oldSnapshots.length) {
          assert.deepStrictEqual(actual, oldSnapshots[snapshotPos])
        }

        snapshots.push(actual)
        snapshotPos += 1
        okAsserts += 1
      },

      throws(block, error) {
        try {
          block()
          assert.fail('Expected to throw')
        } catch (e) {
          error && assert.equal(e, error)
        }
      },
    }))

    console.log(`  ${name}: ${okAsserts} ok`, snapshotPos ? `/ ${snapshotPos} snapshots` : '')
    return snapshots
  } catch (e) {
    console.error(`  ${name} failed\n`, e)
    return oldSnapshots
  }
}

export async function runTests(file, tests) {
  if (uniq(tests, ({ name }) => name).length !== tests.length) {
    throw new Error(`${file} contains tests with similar names`)
  }

  const snapshotsFile = file + '.snap.json'
  const snapshotsFileExists = fs.existsSync(snapshotsFile)
  const oldSnapshots = snapshotsFileExists ? await readJSON(snapshotsFile) : {}

  const newSnapshots = {}
  for (const t of tests) {
    const snapshots = await runTest(t, oldSnapshots[t.name] || [])
    if (snapshots.length) {
      newSnapshots[t.name] = snapshots
    }
  }

  if (Object.values(newSnapshots).length) {
    await writeJSON(snapshotsFile, newSnapshots)
  } else if (snapshotsFileExists) {
    await deleteFile(snapshotsFile)
  }
}
