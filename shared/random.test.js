import { expect } from 'chai'
import { getWords } from './random'

describe('Random', () => {
  it('getWords', () => {
    expect(getWords('Split it, not; dr. go!')).to.deep.equal([ 'split', 'it', ',', 'not', ';', 'dr.', 'go', '!' ])
  })
})
