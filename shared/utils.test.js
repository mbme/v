import { isObject, observable } from './utils'

describe('Utils', () => {
  test('isObject', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject({})).toBe(true)
  })

  test('observable', () => {
    const o = observable(1)

    const cb = jest.fn()
    const unsubscribe = o.subscribe(cb)

    o.set(2)
    unsubscribe()
    o.set(3)

    expect(cb.mock.calls).toEqual([[1], [2]])
  })
})
