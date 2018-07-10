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

// inclusive ? [min, max] : [min, max)
export const randomInt = (min, max, inclusive = true) => Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0)) + min); // eslint-disable-line no-mixed-operators

export function shuffle(array) {
  const result = array.slice(0);

  for (let i = 0; i < array.length; i += 1) {
    const index = randomInt(i, array.length, false);

    // swap items
    const item = result[index];
    result[index] = result[i];
    result[i] = item;
  }

  return result;
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

export function pubSub() {
  const subs = new Map();

  return {
    on(name, handler) {
      const eventSubs = subs.get(name) || new Set();
      eventSubs.add(handler);
      subs.set(name, eventSubs);
    },

    off(name, handler) {
      const eventSubs = subs.get(name) || new Set();
      eventSubs.delete(handler);
      if (!eventSubs.length) {
        subs.delete(name);
      }
    },

    emit(name, params) {
      (subs.get(name) || new Set()).forEach(handler => handler(params));
    },
  };
}

export function observable(initialValue) {
  const subs = [];
  let value = initialValue;

  return {
    get value() {
      return value;
    },
    set(newValue) {
      value = newValue;
      subs.forEach(sub => sub(newValue));
    },
    on(sub) {
      subs.push(sub);
      return () => removeMut(subs, sub);
    },
  };
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
