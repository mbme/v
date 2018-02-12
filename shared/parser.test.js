import { test, before, after } from 'tools/test';
import { parse, select } from './parser';

const text = `
# Header

block
# so not a header

* test
* test

Paragraph and something else. sentence
test *bold* \`code\`

\`\`\`js
 code block
\`\`\`

> some blockquote
> quote

One more paragraph. [[http://link.to/123?321][link]]

`;

before(() => { global.__DEVELOPMENT__ = false; }); // suppress warnings
after(() => { global.__DEVELOPMENT__ = true; });

test('Bold', (assert) => {
  assert.matchSnapshot(parse('*test*', 'Bold'));
  assert.matchSnapshot(parse('* test \\* and* so on', 'Bold'));
  assert.equal(parse(
    `*te
    st*`,
    'Bold',
  ), null);
});

test('Mono', (assert) => {
  assert.matchSnapshot(parse('`test`', 'Mono'));
  assert.matchSnapshot(parse('` test \\` and` so on', 'Mono'));
  assert.matchSnapshot(parse(
    `\`te
    st\``,
    'Mono',
  ), null);
});

test('Header', (assert) => {
  assert.matchSnapshot(parse('# AHAHAH *test oh no* !', 'Header'));
  assert.equal(parse(
    `# AHAHAH *test oh no* !
    there is no empty line
    `,
    'Header',
  ), null);
});

test('Link', (assert) => {
  assert.matchSnapshot(parse('[[http://amazing.com][awesome link]]', 'Link'));
});

test('Paragraph', (assert) => {
  assert.matchSnapshot(parse(
    `
    AHAHAH *test oh no!
    go go _power cows_ \`code\`
    `,
    'Paragraph',
  ));
});

test('Document', (assert) => {
  assert.equal(parse('', 'Document') !== null, true);
  assert.matchSnapshot(parse(text, 'Document'));
});

test('select', (assert) => {
  const links = select(parse(text), 'Link');
  assert.matchSnapshot(links);
});
