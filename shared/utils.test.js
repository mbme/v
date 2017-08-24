import { isObject, isFunction, createSubject } from './utils'

describe('Utils', () => {
  test('isObject', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject({})).toBe(true)
  })

  test('isFunction', () => {
    expect(isFunction(() => true)).toBe(true)
    expect(isFunction(async () => true)).toBe(true)
    expect(isFunction(function testIsFunction() {})).toBe(true)
    expect(isFunction(async function testIsFunction() { return true })).toBe(true)
  })

  test('createSubject', () => {
    const o = createSubject(1)

    const cb = jest.fn()
    const unsubscribe = o.subscribe(cb)
    cb(o.value)

    o.next(2)
    unsubscribe()
    o.next(3)

    expect(cb.mock.calls).toEqual([[1], [2]])
  })
})
