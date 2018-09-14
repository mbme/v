export const getType = elem => Object.prototype.toString.call(elem).slice(8, -1);

export const isObject = elem => getType(elem) === 'Object';
export const isArray = elem => getType(elem) === 'Array';
export const isString = elem => getType(elem) === 'String';
export const isFunction = elem => [ 'Function', 'AsyncFunction' ].includes(getType(elem));
export const isAsyncFunction = elem => getType(elem) === 'AsyncFunction';

/**
 * Check if needle fuzzy matches haystack.
 * @see https://github.com/bevacqua/fuzzysearch
 */
export function fuzzySearch(needle, haystack, ignoreCase = true) {
  if (ignoreCase) return fuzzySearch(needle.toLowerCase(), haystack.toLowerCase(), false);

  const nlen = needle.length;

  // if needle is empty then it matches everything
  if (!nlen) return true;

  const hlen = haystack.length;
  if (nlen > hlen) return false;

  if (nlen === hlen) return needle === haystack;

  outer: for (let i = 0, j = 0; i < nlen; i += 1) {
    const nch = needle.charCodeAt(i);
    while (j < hlen) {
      if (haystack.charCodeAt(j++) === nch) continue outer; // eslint-disable-line no-plusplus
    }
    return false;
  }

  return true;
}

export const capitalize = str => str[0].toUpperCase() + str.substring(1);

export function createArray(size, val) {
  const arr = Array(size);
  if (isFunction(val)) {
    return arr.fill(0).map((_, i) => val(i));
  }

  return arr.fill(val);
}

/**
 * Create new object with specified prototype `proto` and custom `props`
 */
export function extend(proto, props) {
  const propertiesObject = {};

  Object.keys(props).forEach((prop) => {
    propertiesObject[prop] = { value: props[prop] };
  });

  return Object.create(proto, propertiesObject);
}

export function uniq(arr, getKey = val => val) {
  const result = [];
  const keys = [];

  arr.forEach((item) => {
    const key = getKey(item);

    if (!keys.includes(key)) {
      result.push(item);
      keys.push(key);
    }
  });

  return result;
}

export function removeMut(arr, value) {
  const pos = arr.indexOf(value);
  if (pos > -1) {
    arr.splice(pos, 1);
  }

  return arr;
}

export const findById = (arr, id) => arr.find(item => item.id === id);

// [ [ 1, 2 ], 3 ] => [ 1, 2, 3 ]
export function flatten(arr) {
  return arr.reduce((acc, item) => {
    if (isArray(item)) {
      acc.push(...item);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}

export const isSha256 = str => /^[a-f0-9]{64}$/i.test(str);

export function formatTs(ts) {
  const date = new Date(ts);

  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  ].join('/');
}

export const recentComparator = (r1, r2) => r2.updatedTs - r1.updatedTs;

export function mapObject(obj, fn) {
  const result = {};
  Object.entries(obj)
    .map(([ key, value ]) => [ key, fn(value, key) ])
    .forEach(([ key, newValue ]) => { result[key] = newValue; });

  return result;
}

export function apiClient(onAction) {
  return new Proxy({}, {
    get(target, prop) {
      return (data, newFiles) => onAction({ name: prop, data }, newFiles || []);
    },
  });
}
