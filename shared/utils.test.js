import { test } from 'tools/test'
import { isObject, isFunction, createArray, flatten } from './utils'

test('isObject', (assert) => {
  assert.equal(isObject(null), false)
  assert.equal(isObject({}), true)
})

test('isFunction', (assert) => {
  assert.equal(isFunction(() => true), true)
  assert.equal(isFunction(async () => true), true)
  assert.equal(isFunction(function testIsFunction() {}), true)
  assert.equal(isFunction(async function testIsFunction() { return true }), true)
})

test('createArray', (assert) => {
  assert.deepEqual(createArray(3, 0), [ 0, 0, 0 ])
  assert.deepEqual(createArray(3, i => i), [ 0, 1, 2 ])
})

test('flatten', (assert) => {
  assert.equal(flatten([ [ 1, 2 ], 3 ]).toString(), [ 1, 2, 3 ].toString())
})
