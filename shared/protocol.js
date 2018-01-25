// TODO parse from stream
// TODO use buffer.writeUInt32BE
// TODO write number of items in the beginning

// We use custom parser/serializer instead of multipart/form-data because multipart requests
// are too complicated to send using node's http client.
// FORMAT: [length action_string [length fileName length file]*]

const SEPARATOR = ' '

const str2buffer = str => Buffer.from(str, 'utf8')
const serializeItem = buffer => [ str2buffer(String(buffer.length)), str2buffer(SEPARATOR), buffer ]
const serializeItems = (buffers) => {
  const items = buffers.reduce((acc, buffer) => {
    acc.push(...serializeItem(buffer))
    return acc
  }, [])
  return Buffer.concat(items)
}
export const serialize = (action, files) => serializeItems(files.reduce(
  (acc, file) => {
    acc.push(str2buffer(file.name), Buffer.from(file.data))
    return acc
  },
  [ str2buffer(JSON.stringify(action)) ],
))

function getItems(buffer) {
  const items = []
  let pos = 0

  while (pos < buffer.length) {
    // read item length
    const lengthEnd = buffer.indexOf(SEPARATOR, pos)
    if (lengthEnd <= pos) throw new Error('no length end')
    const lengthStr = buffer.toString('utf8', pos, lengthEnd)
    if (!lengthStr.match(/^\d+$/)) throw new Error('corrupted item length')
    const length = parseInt(buffer.toString('utf8', pos, lengthEnd), 10)
    pos = lengthEnd + 1

    // read item
    const itemEnd = pos + length
    if (itemEnd > buffer.length) throw new Error('no enough data')
    items.push(buffer.slice(pos, itemEnd))
    pos = itemEnd
  }

  return items
}

export function parse(buffer) {
  const [ actionBuffer, ...filePartBuffers ] = getItems(buffer)
  const action = JSON.parse(actionBuffer.toString('utf8'))

  if (filePartBuffers.length % 2 !== 0) throw new Error('odd fileParts count')

  const files = []
  for (let i = 0; i < filePartBuffers.length; i += 2) {
    files.push({
      name: filePartBuffers[i].toString('utf8'),
      data: filePartBuffers[i + 1],
    })
  }

  return { action, files }
}
