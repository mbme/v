import { test } from '../tester';
import { validate, assert as validationAssert, assertAll } from './index';

test('positive-integer', ({ equal }) => {
  equal(validate(2, 'positive-integer').length, 0);
  equal(validate(0, 'positive-integer').length, 1);
});

test('string!', ({ equal }) => {
  equal(validate('test', 'string').length, 0);
  equal(validate(1, 'string').length, 1);
  equal(validate('', 'string!').length, 1);
});

test('buffer', ({ equal }) => {
  equal(validate(Buffer.from([]), 'buffer').length, 0);
  equal(validate('test', 'buffer').length, 1);
});

test('validation asserts', (assert) => {
  assert.throws(() => validationAssert(1, 'string'));
  assert.equal(validationAssert('1', 'string'), undefined);

  assert.throws(() => assertAll([ 1, 'string' ]));
  assert.equal(assertAll([ '1', 'string' ]), undefined);
});

test('validate array', (assert) => {
  assert.equal(validate([ 1, '2' ], 'string[]').length, 1);
});
