import { isObject } from './utils'

describe('Utils', () => {
  test('isObject', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject({})).toBe(true)
  })
})
