const { validators, validate } = require('./validators')

describe('Validators', () => {
  test('record id', () => {
    expect(validators.record.id('123')).toBeTruthy()
    expect(validators.record.id(-2)).toBeTruthy()
    expect(validators.record.id(2)).toBeNull()
  })

  test('validate()', () => {
    expect(validate([null], [null, undefined], undefined, null)).toBeUndefined()
    expect(() => validate(undefined, ['test'])).toThrow()
  })
})
