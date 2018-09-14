/* eslint-disable import/no-dynamic-require, global-require */
import path from 'path';
import { walkSync } from '../fs/utils';
import log from '../logger';
import { initTestPlan, getTestPlan, runTests } from './index';

export default async function run(...args) {
  const filter = args.filter(arg => !arg.startsWith('--'))[0] || '';
  const updateSnapshots = args.includes('--update-snapshots');

  const basePath = path.join(__dirname, '..');
  const testFiles = walkSync(basePath)
    .filter(relPath => relPath.endsWith('.test.js') && relPath.includes(filter));

  const testPlans = [];
  for (const testFile of testFiles) {
    initTestPlan();
    require(testFile);
    const testPlan = getTestPlan();

    const only = testPlan.tests.find(test => test.only);
    if (only) {
      if (updateSnapshots) throw new Error("Can't update the 'only' snapshot");

      testPlans.length = 0;
      testPlans.push({ file: testFile, ...testPlan, tests: [ only ] });
      break;
    } else {
      testPlans.push({ file: testFile, ...testPlan });
    }
  }

  let failures = 0;

  for (const testPlan of testPlans) {
    log.simple(path.relative(basePath, testPlan.file));

    if (testPlan.before) {
      await Promise.resolve(testPlan.before());
    }

    failures += await runTests(
      path.join(basePath, testPlan.file),
      testPlan.tests,
      updateSnapshots,
    );

    if (testPlan.after) {
      await Promise.resolve(testPlan.after());
    }

    log.simple('');
  }

  log.simple(failures ? `Failures: ${failures}` : 'Success!', '\n');
}
