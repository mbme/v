/* eslint-env node, browser */

let getRandomBytes;
if (__SERVER__) {
  getRandomBytes = require('crypto').randomBytes; // eslint-disable-line global-require
} else {
  getRandomBytes = bytes => crypto.getRandomBytes(new Uint8Array(bytes));
}

const MAX_RANGE = 2 ** 32;
// [min, max]
export function randomInt(min, max) {
  const range = max - min;
  if (range > MAX_RANGE) {
    throw new Error('range is too wide');
  }
  const maxSample = Math.floor(MAX_RANGE / range) * range;

  let sample;
  do {
    sample = getRandomBytes(4).readUInt32LE();
  } while (sample > maxSample);

  return min + (sample % range);
}

export function shuffle(array) {
  const result = array.slice(0);

  for (let i = 0; i < array.length; i += 1) {
    const index = randomInt(i, array.length - 1);

    // swap items
    const item = result[index];
    result[index] = result[i];
    result[i] = item;
  }

  return result;
}

export const randomArrValue = arr => arr[randomInt(0, arr.length - 1)];

export function randomId(alphabet, size) {
  let id = '';

  for (let i = 0; i < size; i += 1) {
    id += randomArrValue(alphabet);
  }

  return id;
}

export function getCollisionsNumber(n, d) {
  return n - d + d * (((d - 1) / d) ** n);
}
