
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
  test('isObject', () => {
    // expect(isObject(null)).toBe(false)
    // expect(isObject({})).toBe(true)
  })
})
