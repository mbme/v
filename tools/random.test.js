import { test } from 'tools/test'
import { getWords } from './random'


test('getWords', (assert) => {
  assert.deepEqual(getWords('Split it, not; dr. go!'), [ 'split', 'it', ',', 'not', ';', 'dr.', 'go', '!' ])
})
