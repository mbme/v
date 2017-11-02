import { expect } from 'chai'
import { validate, validateAndThrow } from './validators'

describe('Validators', () => {
  it('positive-integer', () => {
    expect(validate(2, 'positive-integer')).to.be.empty
    expect(validate(0, 'positive-integer')).to.have.lengthOf(1)
  })

  it('string!', () => {
    expect(validate('test', 'string')).to.be.empty
    expect(validate(1, 'string')).to.have.lengthOf(1)
    expect(validate('', 'string!')).to.have.lengthOf(1)
  })

  it('buffer', () => {
    expect(validate(Buffer.from([]), 'buffer')).to.be.empty
    expect(validate('test', 'buffer')).to.have.lengthOf(1)
  })

  it('Record', () => {
    expect(validate({
      id: 2,
      type: 'note',
      name: 'test',
      data: '',
    }, 'Record')).to.be.empty

    expect(validate({
      id: -2,
      type: 'other',
      name: 2,
      data: '',
    }, 'Record')).to.have.lengthOf(3)

    expect(validate('test', 'Record')).to.have.lengthOf(1)
  })

  it('File', () => {
    expect(validate({
      name: 'test',
      data: Buffer.from([]),
    }, 'File')).to.be.empty

    expect(validate({
      name: 2,
      data: '',
    }, 'File')).to.have.lengthOf(2)

    expect(validate(null, 'File')).to.have.lengthOf(1)
  })

  it('Record.id', () => {
    expect(validate(2, 'Record.id')).to.be.empty
    expect(validate(-2, 'Record.id')).to.have.lengthOf(1)
  })

  it('validateAndThrow', () => {
    expect(() => {
      validateAndThrow(
        [ 1, 'string' ],
      )
    }).to.throw()

    expect(() => {
      validateAndThrow(
        [ '1', 'string' ]
      )
    }).not.to.throw()
  })

  it('validate array', () => {
    expect(validate([
      {
        name: 'test',
        data: Buffer.from([]),
      },
      {
        name: 'other',
        data: '',
      },
    ], 'File[]')).to.have.lengthOf(1)
  })
})
