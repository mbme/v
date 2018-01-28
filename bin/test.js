/* eslint-disable import/no-dynamic-require, global-require */
import path from 'path'
import { walkSync } from 'server/utils'
import { collectTests, runTests } from 'tools/test'

const args = process.argv.slice(3)
const filter = args.filter(arg => !arg.startsWith('--'))[0] || ''
const updateSnapshots = args.includes('--update-snapshots')

const basePath = path.join(__dirname, '..')
const testFiles = walkSync(basePath)
  .map(filePath => path.relative(basePath, filePath))
  .filter(relPath => relPath.endsWith('.test.js') && relPath.includes(filter))

const testPlans = []
for (const testFile of testFiles) {
  const testPlan = collectTests(() => require(testFile))
  const only = testPlan.tests.find(test => test.only)
  if (only) {
    if (updateSnapshots) throw new Error("Can't update the 'only' snapshot")

    testPlans.length = 0
    testPlans.push({ file: testFile, ...testPlan, tests: [ only ] })
    break
  } else {
    testPlans.push({ file: testFile, ...testPlan })
  }
}

async function executeTestPlans() {
  let failures = 0

  for (const testPlan of testPlans) {
    console.log(testPlan.file)

    testPlan.before && await Promise.resolve(testPlan.before())
    failures += await runTests(path.join(basePath, testPlan.file), testPlan.tests, updateSnapshots)
    testPlan.after && await Promise.resolve(testPlan.after())

    console.log('')
  }

  console.log(failures ? `Failures: ${failures}` : 'Success!', '\n')
}

executeTestPlans().catch(e => console.error('TEST RUNNER FAILED', e))
