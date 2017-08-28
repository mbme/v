import { getWords } from './random'

describe('Random', () => {
  test('getWords', () => {
    expect(getWords('Split it, not; go!')).toEqual(['split', 'it', ',', 'not', ';', 'go', '!'])
  })
})
