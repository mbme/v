import parse from './parser'

const text = `
# Header

block
# so not a header

* test
* test

Paragraph and something else. sentence
test *bold* _italic_ _*bold italic*_ \`code\`

\`\`\`js
 code block
\`\`\`

> some blockquote
> quote

One more paragraph.

`

describe('Parser', () => {
  test('Italic', () => {
    expect(parse('_test_', 'Italic')).toMatchSnapshot()
    expect(parse('_ test \\_ and so on *_test*_', 'Italic')).toMatchSnapshot()
  })

  test('Bold', () => {
    expect(parse('*test*', 'Bold')).toMatchSnapshot()
    expect(parse('* test \\* \\ _and*_ so on*', 'Bold')).toMatchSnapshot()
  })

  test('Mono', () => {
    expect(parse('`test`', 'Mono')).toMatchSnapshot()
    expect(parse('` test \\` \\ _and*_ so on*', 'Mono')).toMatchSnapshot()
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
      go go _power cows_ \`code\`
      `,
      'Paragraph',
    )).toMatchSnapshot()
  })

  test('Document', () => {
    expect(parse(text, 'Document')).toMatchSnapshot()
  })
})
