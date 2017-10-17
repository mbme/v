// TODO preprocess: replace \r\n with \n

const Grammar = {
  Text: {
    children: [],
  },
  Italic: {
    children: [
      'Text',
      'Bold',
    ],
    isStart: (str, pos) => str[pos] === '_',
    isEnd: (str, pos) => str[pos] === '_',
  },
  Bold: {
    children: [
      'Italic',
      'Text',
    ],
    isStart: (str, pos) => str[pos] === '*', // TODO handle escaping with \*
    isEnd: (str, pos) => str[pos] === '*',
  },
  Header: {
    children: [
      'Text',
    ],
    isStart(str, pos) {
      return str[pos] === '#' && (pos === 0 || str[pos - 1] === '\n')
    },
    isEnd(str, pos) {
      return str[pos] === '\n'
    },
  },
  Paragraph: {
    children: [
      'Bold',
      'Italic',
      'Text',
    ],
  },
  Document: {
    children: [
      'Header',
      'Paragraph',
    ],
  },
}

export default function parse(str) {

}
