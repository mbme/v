import { test } from '../tester';
import { getWords } from './text-generator';

test('getWords', (assert) => {
  assert.deepEqual(getWords('Split it, not; dr. go!'), [ 'split', 'it', ',', 'not', ';', 'dr.', 'go', '!' ]);
});
