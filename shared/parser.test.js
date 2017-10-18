import parse from './parser'

const text = `
# Header
block
# so not a header

* test
* test

Paragraph and something else. sentence
test *bold* _123_ _*bold italic*_ \`code\`

\`\`\`js
 code block
\`\`\`

One more paragraph.

`

describe('Parser', () => {
  test('Italic', () => {
    expect(parse('_test_', 'Italic')).toMatchSnapshot()
    expect(parse('_ test and so on *test*_', 'Italic')).toMatchSnapshot()
  })

  test('Bold', () => {
    expect(parse('*test*', 'Bold')).toMatchSnapshot()
    expect(parse('* test _and_ so on*', 'Bold')).toMatchSnapshot()
  })

  test('Header', () => {
    expect(parse('# AHAHAH *test oh no* !', 'Header')).toMatchSnapshot()
    expect(parse(
      `# AHAHAH *test oh no* !
      there is no empty line
      `,
      'Header',
    )).toBeNull()
  })

  test('Paragraph', () => {
    expect(parse(
      `
      AHAHAH *test oh no* !
      go go _power cows_
      `,
      'Paragraph',
    )).toMatchSnapshot()
  })
})
