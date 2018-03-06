import { test, before, after } from 'tools/test';
import { parse, select } from './parser';

const text = `
# Header1
block
## Header2

* test
* test

Paragraph and something else. sentence
test *bold\\**
test \`code\\\`\`
test ~strikethrough\\~~ text

\`\`\`js
 code block
\`\`\`

\`\`\`quote:Albert Einstein
Few are those who see with their own eyes and feel with their own hearts.
\`\`\`

One more paragraph. [[http://link.to/123?321][link]]
And image link without description [[image:0d4dbbed6733f4038a8b72dfe1b02030d3bb8fad803e329e3b0bf41f7f8a4452]]

`;

before(() => { global.__DEVELOPMENT__ = false; }); // suppress warnings
after(() => { global.__DEVELOPMENT__ = true; });

test('Markup', (assert) => {
  const result = parse(text);

  assert.equal(select(result, 'Paragraph').length, 6);
  assert.equal(select(result, 'Header').length, 2);
  assert.equal(select(result, 'ListItem').length, 2);

  const bold = select(result, 'Bold');
  assert.equal(bold.length, 1);
  assert.equal(bold[0].text, 'bold*');

  const mono = select(result, 'Mono');
  assert.equal(mono.length, 1);
  assert.equal(mono[0].text, 'code`');

  const strikethrough = select(result, 'Strikethrough');
  assert.equal(strikethrough.length, 1);
  assert.equal(strikethrough[0].text, 'strikethrough~');

  assert.equal(select(result, 'Link').length, 2);

  const code = select(result, 'CodeBlock');
  assert.equal(code.length, 2);
  assert.equal(code[0].lang, 'js');
  assert.equal(code[1].source, 'Albert Einstein');
});
