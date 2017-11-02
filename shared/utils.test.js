import { expect } from 'chai'
import { isObject, isFunction, createArray } from './utils'

describe('Utils', () => {
  it('isObject', () => {
    expect(isObject(null)).to.be.false
    expect(isObject({})).to.be.true
  })

  it('isFunction', () => {
    expect(isFunction(() => true)).to.be.true
    expect(isFunction(async () => true)).to.be.true
    expect(isFunction(function testIsFunction() {})).to.be.true
    expect(isFunction(async function testIsFunction() { return true })).to.be.true
  })

  it('createArray', () => {
    expect(createArray(3, 0)).to.deep.equal([ 0, 0, 0 ])
    expect(createArray(3, i => i)).to.deep.equal([ 0, 1, 2 ])
  })
})
