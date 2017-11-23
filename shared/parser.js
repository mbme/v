/* eslint-disable no-labels, no-continue, no-extra-label, no-constant-condition, no-restricted-syntax */
import { isString, uniq, isSha256 } from 'shared/utils'

const isChar = char => (str, i) => str[i] === char
const isNewline = isChar('\n')
const postprocessTextItem = tree => ({ type: tree.type, text: tree.items[0] })

const declareType = type => ({
  skip: [ 0, 0 ],
  children: [],
  isBreak: () => false,
  isValid: () => true,
  postprocess: tree => tree,
  ...type,
})

const LinkTypes = {
  image: 'image:',
  common: '',
}

const Grammar = {
  Bold: declareType({
    skip: [ 1, 1 ],
    escapeChar: '*',
    isStart: isChar('*'),
    isBreak: isNewline,
    isEnd: isChar('*'),
    postprocess: postprocessTextItem,
  }),

  Mono: declareType({
    skip: [ 1, 1 ],
    escapeChar: '`',
    isStart: isChar('`'),
    isBreak: isNewline,
    isEnd: isChar('`'),
    postprocess: postprocessTextItem,
  }),

  LinkPart: declareType({
    skip: [ 1, 1 ],
    escapeChar: ']',
    isStart: isChar('['),
    isBreak: isNewline,
    isEnd: isChar(']'),
    postprocess: postprocessTextItem,
  }),

  Link: declareType({
    skip: [ 1, 1 ],
    children: [ 'LinkPart' ],
    isStart: isChar('['),
    isEnd: isChar(']'),
    isValid: ({ items }) => items.length === 2 && items[0].type === 'LinkPart' && items[1].type === 'LinkPart',
    postprocess(tree) {
      const [ addressItem, nameItem ] = tree.items

      for (const [ linkType, prefix ] of Object.entries(LinkTypes)) {
        if (addressItem.text.startsWith(prefix)) {
          const address = addressItem.text.substring(prefix.length)
          return {
            type: tree.type,
            link: {
              type: linkType,
              name: nameItem.text,
              address,
              isInternal: isSha256(address),
            },
          }
        }
      }

      throw new Error('unreachable')
    },
  }),

  Paragraph: declareType({
    children: [ 'Bold', 'Mono', 'Link' ],
    isStart: (str, pos) => pos === 0 || (str[pos] !== '\n' && str[pos - 1] === '\n'),
    isEnd(str, pos) {
      if (pos === str.length) {
        return true
      }

      const ending = str.slice(pos, pos + 2)
      if (ending === '\n' || ending === '\n\n') {
        return true
      }

      return false
    },
  }),

  Header: declareType({
    skip: [ 1, 0 ],
    isStart: (str, pos) => {
      if (str.slice(pos, pos + 2) !== '# ') {
        return false
      }

      if (pos > 0 && str[pos - 1] !== '\n') { // check newline before #
        return false
      }

      const newLinePos = str.indexOf('\n', pos)
      if (newLinePos === -1) {
        return true
      }

      // check if there is an empty line after header
      if (newLinePos + 1 < str.length && str[newLinePos + 1] !== '\n') {
        return false
      }

      return true
    },
    isEnd: (str, pos) => pos === str.length || str[pos] === '\n',
    postprocess: postprocessTextItem,
  }),

  Document: declareType({
    children: [ 'Header', 'Paragraph' ],
    isStart: (str, pos) => pos === 0,
    isEnd: (str, pos) => pos === str.length,
  }),
}

if (global.__DEVELOPMENT__) { // validate grammar
  Object.entries(Grammar).forEach(([ type, rule ]) => {
    rule.children.forEach(childType => !!Grammar[childType] || console.error(`WARN: ${type} has unknown child "${childType}"`))
  })
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
  let ended = false

  outer:
  while (true) {
    // handle escapes
    if (str[i] === '\\' && rule.escapeChar === str[i + 1]) {
      text += str[i + 1]
      i += 2
      continue outer
    }

    if (str[i] === '\r') { // ignore \r
      i += 1
      continue outer
    }

    if (rule.isEnd(str, i)) {
      ended = true
      i += skipEnd
      break outer
    }

    if (i === str.length) {
      break outer
    }

    inner:
    for (const childType of rule.children) {
      const [ length, leaf ] = parseFrom(str, i, childType, [ ...context, type ])
      if (!length) {
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

    if (rule.isBreak(str, i)) {
      return [ 0, null ]
    }

    text += str[i]
    i += 1
  }

  if (text) {
    tree.items.push(text)
  }

  // validate result
  if (!ended || !rule.isValid(tree)) {
    return [ 0, null ]
  }

  const length = i - pos

  return [ length, rule.postprocess(tree) ]
}

function assertType(type) {
  if (Grammar[type]) {
    return
  }

  throw new Error(`Uknown type ${type}`)
}

export function parse(str, type = 'Document') {
  assertType(type)

  const [ i, tree ] = parseFrom(str, 0, type, [])

  if (global.__DEVELOPMENT__ && i !== str.length) {
    console.error(`WARN: rule ${type} covers ${i} out of ${str.length} chars`)
  }

  return tree
}

export function select(tree, type) {
  assertType(type)

  if (!tree || isString(tree)) {
    return []
  }

  const result = []
  if (tree.type === type) {
    result.push(tree)
  }

  (tree.items || []).forEach(child => result.push(...select(child, type)))

  return result
}

export const extractFileIds = tree => uniq(select(tree, 'Link').map(({ link }) => link.isInternal ? link.address : null).filter(Boolean))

export const createLink = (name, link) => `[[${link}][${name}]]`
export const createImageLink = (name, link) => createLink(name, `image:${link}`)
