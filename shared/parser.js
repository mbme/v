/* eslint-disable no-labels, no-continue, no-restricted-syntax */
// TODO preprocess: replace \r\n with \n

export const Grammar = {
  Italic: {
    skip: [ 1, 1 ],
    children: [
      'Bold',
    ],
    isStart: (str, pos, context) => str[pos] === '_' && !context.includes('Italic'),
    isEnd: (str, pos) => str[pos] === '_',
  },

  Bold: {
    skip: [ 1, 1 ],
    children: [
      'Italic',
    ],
    isStart: (str, pos, context) => str[pos] === '*' && !context.includes('Bold'), // TODO handle escaping with \*
    isEnd: (str, pos) => str[pos] === '*',
  },

  Header: {
    skip: [ 1, 1 ],
    children: [],
    isStart: (str, pos) => {
      if (str[pos] !== '#') {
        return false
      }

      if (pos > 0 && str[pos - 1] !== '\n') { // check newline before #
        return false
      }

      const newLinePos = str.indexOf('\n', pos)

      // check if there is an empty line after header
      if (newLinePos !== -1 && newLinePos + 1 < str.length && str[newLinePos + 1] !== '\n') {
        return false
      }

      return true
    },
    isEnd: (str, pos) => str[pos] === '\n',
  },

  Paragraph: {
    skip: [ 0, 0 ],
    children: [
      'Bold',
      'Italic',
    ],
    isStart: (str, pos) => pos === 0 || (str[pos] === '\n' && str[pos - 1] === '\n'),
    isEnd: (str, pos) => str[pos] === '\n' && (pos + 1 === str.length || str[pos + 1] === '\n'),
  },

  Document: {
    children: [
      'Header',
      'Paragraph',
    ],
  },
}

export function parseFrom(str, pos, type, context) {
  const rule = Grammar[type]
  const [ skipStart, skipEnd ] = rule.skip

  let i = pos
  if (!rule.isStart(str, i, context)) {
    return [ 0, null ]
  }

  i += skipStart

  const tree = {
    type,
    items: [],
  }
  let text = ''

  outer:
  while (!rule.isEnd(str, i) && i < str.length) {
    for (const childType of rule.children) {
      const [ length, leaf ] = parseFrom(str, i, childType, [ ...context, type ])
      if (!leaf) {
        continue
      }

      if (text) {
        tree.items.push(text)
        text = ''
      }

      i += length
      tree.items.push(leaf)

      continue outer
    }

    text += str[i]
    i += 1
  }

  if (text) {
    tree.items.push(text)
  }

  i += skipEnd

  const length = i - pos

  return [ length, tree ]
}

export default function parse(str, type) {
  const [ , tree ] = parseFrom(str, 0, type, [])
  return tree
}
