// TODO ensure uniq test names inside files

import fs from 'fs'
import assert from 'assert'

let tests

export function collectTests(cb) {
  tests = []
  cb()
  const result = tests
  tests = null
  return result
}

export default function test(name, fn, only = false) {
  tests.push({ name, fn, only })
}

function runTest({ name, fn }, oldSnapshots) {
  console.log(`  # ${name}`)

  let okAsserts = 0
  let snapshotPos = 0
  const snapshots = []

  try {
    fn({
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

      throws(block) {
        try {
          block()
          assert.fail('Expected to throw')
        } catch (e) {
          // everything is fine
        }
      },
    })

    console.log(`  ${okAsserts} ok (${snapshotPos} snapshots)\n`)
    return snapshots
  } catch (e) {
    console.error(`  ${name} failed\n`, e)
    return oldSnapshots
  }
}

export function runTests(file, testConfigs) {
  const snapshotsFile = file + '.snap.json'
  const snapshotsFileExists = fs.existsSync(snapshotsFile)
  const oldSnapshots = snapshotsFileExists ? JSON.parse(fs.readFileSync(snapshotsFile, 'utf8')) : {}

  const newSnapshots = {}
  for (const testConfig of testConfigs) {
    const snapshots = runTest(testConfig, oldSnapshots[testConfig.name] || [])
    if (snapshots.length) {
      newSnapshots[testConfig.name] = snapshots
    }
  }

  if (Object.values(newSnapshots).length) {
    fs.writeFileSync(snapshotsFile, JSON.stringify(newSnapshots, null, 2), 'utf8')
  } else if (snapshotsFileExists) {
    fs.unlinkSync(snapshotsFile)
  }
}
