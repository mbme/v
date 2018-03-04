import { isString, uniq, isSha256 } from 'shared/utils';

const isChar = char => (str, i) => str[i] === char;
const isNewline = isChar('\n');
const postprocessTextItem = tree => ({ type: tree.type, text: tree.items[0] });

const LinkTypes = {
  image: 'image:',
  common: '',
};

function postprocessLink(tree) {
  const [ addressItem, nameItem ] = tree.items;

  for (const [ linkType, prefix ] of Object.entries(LinkTypes)) {
    if (addressItem.text.startsWith(prefix)) {
      const address = addressItem.text.substring(prefix.length);
      return {
        type: tree.type,
        link: {
          type: linkType,
          name: nameItem ? nameItem.text : '',
          address,
          isInternal: isSha256(address),
        },
      };
    }
  }

  throw new Error('unreachable');
}

function postprocessHeader(tree) {
  const text = tree.items[0];
  const lvl = text.startsWith('# ') ? 1 : 2;
  return {
    type: tree.type,
    lvl,
    text: text.substring(lvl + 1),
  };
}

const declareType = type => ({
  skip: [ 0, 0 ],
  children: [],
  isBreak: () => false,
  isValid: () => true,
  postprocess: tree => tree,
  ...type,
});


const INLINE_TYPES = [ 'Bold', 'Mono', 'Strikethrough', 'Link' ];

const Grammar = {
  Bold: declareType({ // some *bold* text
    skip: [ 1, 1 ],
    escapeChar: '*',
    isStart: isChar('*'),
    isBreak: isNewline,
    isEnd: isChar('*'),
    postprocess: postprocessTextItem,
  }),

  Mono: declareType({ // some `monospace` text
    skip: [ 1, 1 ],
    escapeChar: '`',
    isStart: isChar('`'),
    isBreak: isNewline,
    isEnd: isChar('`'),
    postprocess: postprocessTextItem,
  }),

  Strikethrough: declareType({ // some ~striketrough~ text
    skip: [ 1, 1 ],
    escapeChar: '~',
    isStart: isChar('~'),
    isBreak: isNewline,
    isEnd: isChar('~'),
    postprocess: postprocessTextItem,
  }),

  Header: declareType({ // # Header lvl 1 or ## Header lvl 2
    isStart: (str, pos) => {
      if (pos > 0 && str[pos - 1] !== '\n') return false;

      if (str.slice(pos, pos + 2) === '# ') return true;
      if (str.slice(pos, pos + 3) === '## ') return true;

      return false;
    },
    isEnd: (str, pos) => pos === str.length || str[pos] === '\n',
    postprocess: postprocessHeader,
  }),

  LinkPart: declareType({
    skip: [ 1, 1 ],
    escapeChar: ']',
    isStart: isChar('['),
    isBreak: isNewline,
    isEnd: isChar(']'),
    postprocess: postprocessTextItem,
  }),

  Link: declareType({ // links [[type:ref][name]] or [[type:ref]]
    skip: [ 1, 1 ],
    children: [ 'LinkPart' ],
    isStart: isChar('['),
    isEnd: isChar(']'),
    isValid: ({ items }) => {
      if (items.length !== 1 && items.length !== 2) return false;

      return items.filter(item => item.type !== 'LinkPart').length === 0;
    },
    postprocess: postprocessLink,
  }),

  ListItem: declareType({ // * Unordered list
    children: [ ...INLINE_TYPES ],
    skip: [ 1, 0 ],
    isStart: (str, pos) => {
      if (pos > 0 && str[pos - 1] !== '\n') return false;

      if (str.slice(pos, pos + 2) === '* ') return true;

      return false;
    },
    isEnd: (str, pos) => pos === str.length || str[pos] === '\n',
    postprocess: postprocessTextItem,
  }),

  Paragraph: declareType({
    children: [ 'Header', 'ListItem', ...INLINE_TYPES ],
    isStart: (str, pos) => pos === 0 || (str[pos] !== '\n' && str[pos - 1] === '\n'),
    isEnd(str, pos) {
      if (pos === str.length) return true;

      const ending = str.slice(pos, pos + 2);
      if (ending === '\n' || ending === '\n\n') return true;

      return false;
    },
  }),

  Document: declareType({
    children: [ 'Paragraph' ],
    isStart: (str, pos) => pos === 0,
    isEnd: (str, pos) => pos === str.length,
  }),
};

if (global.__DEVELOPMENT__) { // validate grammar
  Object.entries(Grammar).forEach(([ type, rule ]) => {
    rule.children.forEach(childType => !!Grammar[childType] || console.error(`WARN: ${type} has unknown child "${childType}"`));
  });
}

export function parseFrom(str, pos, type, context) {
  const rule = Grammar[type];
  const [ skipStart, skipEnd ] = rule.skip;

  let i = pos;
  if (!rule.isStart(str, i, context)) return [ 0, null ];

  i += skipStart;

  const tree = { type, items: [] };
  let text = '';
  let ended = false;

  outer:
  while (true) { // eslint-disable-line no-constant-condition
    // handle escapes
    if (str[i] === '\\' && rule.escapeChar === str[i + 1]) {
      text += str[i + 1];
      i += 2;
      continue outer;
    }

    if (str[i] === '\r') { // ignore \r
      i += 1;
      continue outer;
    }

    if (rule.isEnd(str, i)) {
      ended = true;
      i += skipEnd;
      break outer;
    }

    if (i === str.length) break outer;

    inner:
    for (const childType of rule.children) {
      const [ length, leaf ] = parseFrom(str, i, childType, [ ...context, type ]);

      if (!length) continue inner;

      if (text) {
        tree.items.push(text);
        text = '';
      }

      i += length;
      tree.items.push(leaf);

      continue outer;
    }

    if (rule.isBreak(str, i)) return [ 0, null ];

    text += str[i];
    i += 1;
  }

  if (text) tree.items.push(text);

  // validate result
  if (!ended || !rule.isValid(tree)) return [ 0, null ];

  const length = i - pos;

  return [ length, rule.postprocess(tree) ];
}

export function parse(str) {
  const [ i, tree ] = parseFrom(str, 0, 'Document', []);

  if (global.__DEVELOPMENT__ && i !== str.length) {
    console.error(`WARN: parser covers ${i} out of ${str.length} chars`);
  }

  return tree;
}

export function select(tree, type) {
  if (!Grammar[type]) throw new Error(`Uknown type ${type}`);

  if (!tree || isString(tree)) return [];

  const result = [];
  if (tree.type === type) result.push(tree);

  (tree.items || []).forEach(child => result.push(...select(child, type)));

  return result;
}

export function extractFileIds(tree) {
  return uniq(select(tree, 'Link').reduce((acc, { link }) => {
    if (link.isInternal) acc.push(link.address);

    return acc;
  }, []));
}

export const createLink = (name = '', link) => name ? `[[${link}][${name}]]` : `[[${link}]]`;
export const createImageLink = (name, link) => createLink(name, `image:${link}`);
