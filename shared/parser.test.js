import chai, { expect } from 'chai'
import chaiJestSnapshot from 'chai-jest-snapshot'
import { parse, select, selectLinks } from './parser'

chai.use(chaiJestSnapshot)

before(() => {
  chaiJestSnapshot.resetSnapshotRegistry()
})

beforeEach(function setupSnapshots() {
  chaiJestSnapshot.configureUsingMochaContext(this)
})

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
  it('Italic', () => {
    expect(parse('_test_', 'Italic')).to.matchSnapshot()
    expect(parse('_ test \\_ and so on *_test*_', 'Italic')).to.matchSnapshot()
    expect(parse(
      `_te
      st_`,
      'Italic',
    )).to.be.null
  })

  it('Bold', () => {
    expect(parse('*test*', 'Bold')).to.matchSnapshot()
    expect(parse('* test \\* \\ _and*_ so on*', 'Bold')).to.matchSnapshot()
    expect(parse(
      `*te
      st*`,
      'Bold',
    )).to.be.null
  })

  it('Mono', () => {
    expect(parse('`test`', 'Mono')).to.matchSnapshot()
    expect(parse('` test \\` \\ _and*_ so on*`', 'Mono')).to.matchSnapshot()
    expect(parse(
      `\`te
      st\``,
      'Mono',
    )).to.be.null
  })

  it('Header', () => {
    expect(parse('# AHAHAH *test oh no* !', 'Header')).to.matchSnapshot()
    expect(parse(
      `# AHAHAH *test oh no* !
      there is no empty line
      `,
      'Header',
    )).to.be.null
  })

  it('Link', () => {
    expect(parse('[awesome link](http://amazing.com)', 'Link')).to.matchSnapshot()
  })

  it('Paragraph', () => {
    expect(parse(
      `
      AHAHAH *test oh no!
      go go _power cows_ \`code\`
      `,
      'Paragraph',
    )).to.matchSnapshot()
  })

  it('Document', () => {
    expect(parse(text, 'Document')).to.matchSnapshot()
  })

  it('select', () => {
    const links = select(parse(text), 'Link')
    expect(links).to.matchSnapshot()
  })

  it('selectLinks', () => {
    const links = selectLinks(parse(text))
    expect(links).to.matchSnapshot()
  })
})
