/* eslint-disable import/no-dynamic-require, global-require */
import path from 'path'
import { walkSync } from 'server/utils'
import { collectTests, runTests } from 'tools/test'

const filter = process.argv.length > 3 ? process.argv[3] : ''

const basePath = path.join(__dirname, '..')
const testFiles = walkSync(basePath)
  .map(filePath => path.relative(basePath, filePath))
  .filter(relPath => relPath.endsWith('.test.js') && relPath.includes(filter))

const testPlans = []
for (const testFile of testFiles) {
  console.log(`+ ${testFile}`)
  const tests = collectTests(() => require(testFile))
  const only = tests.find(test => test.only)
  if (only) {
    testPlans.length = 0
    testPlans.push({ file: testFile, tests: [ only ] })
    break
  } else {
    testPlans.push({ file: testFile, tests })
  }
}
console.log('')

for (const testPlan of testPlans) {
  console.log(testPlan.file)
  runTests(path.join(basePath, testPlan.file), testPlan.tests)
}
