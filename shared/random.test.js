import { getWords } from './random'

describe('Random', () => {
  test('getWords', () => {
    expect(getWords('Split it, not; dr. go!')).toEqual([ 'split', 'it', ',', 'not', ';', 'dr.', 'go', '!' ])
  })
})
