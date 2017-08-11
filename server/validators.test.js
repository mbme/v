import { validate } from './validators'

describe('Validators', () => {
  test('positive-integer', () => {
    expect(validate(2, 'positive-integer')).toHaveLength(0)
    expect(validate(0, 'positive-integer')).toHaveLength(1)
  })

  test('string', () => {
    expect(validate('test', 'string')).toHaveLength(0)
    expect(validate(1, 'string')).toHaveLength(1)
  })

  test('buffer', () => {
    expect(validate(Buffer.from([]), 'buffer')).toHaveLength(0)
    expect(validate('test', 'buffer')).toHaveLength(1)
  })

  test('Record', () => {
    expect(validate({
      id: 2,
      type: 'note',
      name: 'test',
      data: '',
    }, 'Record')).toHaveLength(0)

    expect(validate({
      id: -2,
      type: 'other',
      name: 2,
      data: '',
    }, 'Record')).toHaveLength(3)

    expect(validate('test', 'Record')).toHaveLength(1)
  })

  test('File', () => {
    expect(validate({
      name: 'test',
      data: Buffer.from([]),
    }, 'File')).toHaveLength(0)

    expect(validate({
      name: 2,
      data: '',
    }, 'File')).toHaveLength(2)

    expect(validate(null, 'File')).toHaveLength(1)
  })
})
