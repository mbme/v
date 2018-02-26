import { flatten } from 'shared/utils';
// TODO parse from stream
// TODO use buffer.writeUInt32LE
// TODO write number of items in the beginning

// We use custom parser/serializer instead of multipart/form-data because multipart requests
// are too complicated to build & send using node's http client.
// FORMAT: [length action_string [length file]*]

const SEPARATOR = ' ';

/**
 * @param {string} action JSON string with action
 * @param {(Buffer|ArrayBuffer)[]} fileBuffers array of file buffers
 */
export function serialize(action, fileBuffers, PlatformBuffer) {
  const buffers = flatten([
    PlatformBuffer.fromStr(JSON.stringify(action)),
    ...fileBuffers,
  ].map(buffer => ([
    PlatformBuffer.fromStr(String(buffer.length)),
    PlatformBuffer.fromStr(SEPARATOR),
    buffer,
  ])));

  return PlatformBuffer.concat(buffers);
}

function getItems(buffer) {
  const items = [];
  let pos = 0;

  while (pos < buffer.length) {
    // read item length
    const lengthEnd = buffer.indexOf(SEPARATOR, pos);
    if (lengthEnd <= pos) throw new Error('no length end');
    const lengthStr = buffer.toString('utf8', pos, lengthEnd);
    if (!lengthStr.match(/^\d+$/)) throw new Error('corrupted item length');
    const length = parseInt(buffer.toString('utf8', pos, lengthEnd), 10);
    pos = lengthEnd + 1;

    // read item
    const itemEnd = pos + length;
    if (itemEnd > buffer.length) throw new Error('no enough data');
    items.push(buffer.slice(pos, itemEnd));
    pos = itemEnd;
  }

  return items;
}

export function parse(buffer) {
  const [ actionBuffer, ...fileBuffers ] = getItems(buffer);
  const action = JSON.parse(actionBuffer.toString('utf8'));

  return { action, files: fileBuffers };
}
