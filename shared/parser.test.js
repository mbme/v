import { parse, select, selectLinks } from './parser'

global.__DEVELOPMENT__ = false // suppress warnings

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

One more paragraph. [link](http://link.to/123?321)

`

describe('Parser', () => {
  test('Italic', () => {
    expect(parse('_test_', 'Italic')).toMatchSnapshot()
    expect(parse('_ test \\_ and so on *_test*_', 'Italic')).toMatchSnapshot()
    expect(parse(
      `_te
      st_`,
      'Italic',
    )).toBeNull()
  })

  test('Bold', () => {
    expect(parse('*test*', 'Bold')).toMatchSnapshot()
    expect(parse('* test \\* \\ _and*_ so on*', 'Bold')).toMatchSnapshot()
    expect(parse(
      `*te
      st*`,
      'Bold',
    )).toBeNull()
  })

  test('Mono', () => {
    expect(parse('`test`', 'Mono')).toMatchSnapshot()
    expect(parse('` test \\` \\ _and*_ so on*`', 'Mono')).toMatchSnapshot()
    expect(parse(
      `\`te
      st\``,
      'Mono',
    )).toBeNull()
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

  test('Link', () => {
    expect(parse('[awesome link](http://amazing.com)', 'Link')).toMatchSnapshot()
  })

  test('Paragraph', () => {
    expect(parse(
      `
      AHAHAH *test oh no!
      go go _power cows_ \`code\`
      `,
      'Paragraph',
    )).toMatchSnapshot()
  })

  test('Document', () => {
    expect(parse(text, 'Document')).toMatchSnapshot()
  })

  test('select', () => {
    const links = select(parse(text), 'Link')
    expect(links).toMatchSnapshot()
  })

  test('selectLinks', () => {
    const links = selectLinks(parse(text))
    expect(links).toMatchSnapshot()
  })
})
