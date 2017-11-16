/* eslint-disable no-labels, no-continue, no-extra-label, no-constant-condition, no-restricted-syntax */
import { isString } from 'shared/utils'

const isChar = char => (str, i) => str[i] === char
const isNewline = isChar('\n')

const declareType = type => ({ skip: [ 0, 0 ], children: [], isBreak: () => false, isValid: () => true, ...type })

const Grammar = {
  Bold: declareType({
    skip: [ 1, 1 ],
    escapeChar: '*',
    isStart: isChar('*'),
    isBreak: isNewline,
    isEnd: isChar('*'),
  }),

  Mono: declareType({
    skip: [ 1, 1 ],
    escapeChar: '`',
    isStart: isChar('`'),
    isBreak: isNewline,
    isEnd: isChar('`'),
  }),

  LinkPart: declareType({
    skip: [ 1, 1 ],
    escapeChar: ']',
    isStart: isChar('['),
    isBreak: isNewline,
    isEnd: isChar(']'),
  }),

  Link: declareType({
    skip: [ 1, 1 ],
    children: [ 'LinkPart' ],
    isStart: isChar('['),
    isEnd: isChar(']'),
    isValid: ({ items }) => items.length === 2 && items[0].type === 'LinkPart' && items[1].type === 'LinkPart',
  }),

  Paragraph: declareType({
    children: [ 'Bold', 'Mono', 'Link' ],
    isStart: (str, pos) => pos === 0 || (str[pos] === '\n' && str[pos - 1] === '\n'),
    isEnd(str, pos) {
      if (pos === str.length) {
        return true
      }

      if (str[pos] !== '\n') {
        return false
      }


      if (pos + 1 === str.length || str[pos + 1] === '\n') {
        return true
      }

      return false
    },
  }),

  Header: declareType({
    skip: [ 1, 0 ],
    isStart: (str, pos) => {
      if (str[pos] !== '#' && str[pos + 1] !== ' ') {
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

  return [ length, tree ]
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

  tree.items.forEach(child => result.push(...select(child, type)))

  return result
}

export const selectLinks = tree => select(tree, 'Link').map(({ items: [ link, name ] }) => ({ name: name.items[0], link: link.items[0] }))

const isSha256 = str => /^[a-f0-9]{64}$/i.test(str)

export const selectFileLinks = tree => selectLinks(tree).map(({ link }) => link).filter(isSha256)
export const createLink = (name, link) => `[[${link}][${name}]]`
