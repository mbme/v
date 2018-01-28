import { test } from 'tools/test'
import { validate, validateAndThrow } from './validators'

test('positive-integer', (assert) => {
  assert.equal(validate(2, 'positive-integer').length, 0)
  assert.equal(validate(0, 'positive-integer').length, 1)
})

test('string!', (assert) => {
  assert.equal(validate('test', 'string').length, 0)
  assert.equal(validate(1, 'string').length, 1)
  assert.equal(validate('', 'string!').length, 1)
})

test('buffer', (assert) => {
  assert.equal(validate(Buffer.from([]), 'buffer').length, 0)
  assert.equal(validate('test', 'buffer').length, 1)
})

test('Record', (assert) => {
  assert.equal(validate({
    id: 2,
    type: 'note',
    name: 'test',
    data: '',
  }, 'Record').length, 0)

  assert.equal(validate({
    id: -2,
    type: 'other',
    name: 2,
    data: '',
  }, 'Record').length, 3)

  assert.equal(validate('test', 'Record').length, 1)
})

test('File', (assert) => {
  assert.equal(validate({
    name: 'test',
    data: Buffer.from([]),
  }, 'File').length, 0)

  assert.equal(validate({
    name: 2,
    data: '',
  }, 'File').length, 2)

  assert.equal(validate(null, 'File').length, 1)
})

test('Record.id', (assert) => {
  assert.equal(validate(2, 'Record.id').length, 0)
  assert.equal(validate(-2, 'Record.id').length, 1)
})

test('validateAndThrow', (assert) => {
  assert.throws(() => validateAndThrow([ 1, 'string' ]))
  assert.equal(validateAndThrow([ '1', 'string' ]), undefined)
})

test('validate array', (assert) => {
  assert.equal(validate([
    {
      name: 'test',
      data: Buffer.from([]),
    },
    {
      name: 'other',
      data: '',
    },
  ], 'File[]').length, 1)
})
