/* eslint-disable no-labels, no-continue, no-extra-label, no-constant-condition, no-restricted-syntax */
// TODO preprocess: replace \r\n with \n

export const Grammar = {
  Italic: {
    skip: [ 1, 1 ],
    children: [ 'Bold' ],
    escapeChar: '_',
    isStart: (str, pos, context) => str[pos] === '_' && !context.includes('Italic'),
    isEnd: (str, pos) => str[pos] === '_',
  },

  Bold: {
    skip: [ 1, 1 ],
    children: [ 'Italic' ],
    escapeChar: '*',
    isStart: (str, pos, context) => str[pos] === '*' && !context.includes('Bold'),
    isEnd: (str, pos) => str[pos] === '*',
  },

  Header: {
    skip: [ 1, 0 ],
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
    isEnd: (str, pos) => pos === str.length || str[pos] === '\n',
  },

  Paragraph: {
    skip: [ 0, 0 ],
    children: [ 'Bold', 'Italic' ],
    isStart: (str, pos) => pos === 0 || (str[pos] === '\n' && str[pos - 1] === '\n'),
    isEnd: (str, pos) => str[pos] === '\n' && (pos + 1 === str.length || str[pos + 1] === '\n'),
  },

  Document: {
    children: [ 'Header', 'Paragraph' ],
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
    ended: false,
  }
  let text = ''

  outer:
  while (true) {
    // handle escapes
    if (i < str.length && str[i] === '\\' && rule.escapeChar === str[i + 1]) {
      text += str[i + 1]
      i += 2
      continue outer
    }

    if (rule.isEnd(str, i)) {
      tree.ended = true
      i += skipEnd
      break outer
    }

    if (i >= str.length) {
      break outer
    }

    inner:
    for (const childType of rule.children) {
      const [ length, leaf ] = parseFrom(str, i, childType, [ ...context, type ])
      if (!leaf) {
        continue inner
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

  const length = i - pos

  return [ length, tree ]
}

export default function parse(str, type) {
  const [ i, tree ] = parseFrom(str, 0, type, [])
  if (tree && i !== str.length) {
    console.error('WARN', i, str.length)
  }
  return tree
}
