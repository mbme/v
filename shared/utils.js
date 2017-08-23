export function getType(elem) {
  return Object.prototype.toString.call(elem).slice(8, -1)
}

export function isObject(elem) {
  return getType(elem) === 'Object'
}

export function isArray(elem) {
  return getType(elem) === 'Array'
}

export function isFunction(elem) {
  return getType(elem) === 'Function'
}

export function isString(elem) {
  return getType(elem) === 'String'
}

/**
 * Check if needle fuzzy matches haystack.
 * @see https://github.com/bevacqua/fuzzysearch
 */
export function fuzzySearch(needle, haystack) {
  const nlen = needle.length

  // if needle is empty then it matches everything
  if (!nlen) {
    return true
  }

  const hlen = haystack.length
  if (nlen > hlen) {
    return false
  }

  if (nlen === hlen) {
    return needle === haystack
  }

  outer: for (let i = 0, j = 0; i < nlen; i += 1) { // eslint-disable-line
    const nch = needle.charCodeAt(i)
    while (j < hlen) {
      if (haystack.charCodeAt(j++) === nch) { // eslint-disable-line
        continue outer // eslint-disable-line
      }
    }
    return false
  }

  return true
}

function getInRec(obj, [prop, ...rest]) {
  if (!rest.length) {
    return obj[prop]
  }

  return getInRec(obj[prop], rest)
}

export function getIn(obj, propName) {
  return getInRec(obj, propName.split('.'))
}

export function observable(initialValue) {
  let currentValue = initialValue
  const subscribers = []

  return {
    set(value) {
      currentValue = value
      subscribers.forEach(cb => cb(currentValue))
    },

    subscribe(cb) {
      subscribers.push(cb)
      cb(currentValue)

      return () => {
        const pos = subscribers.indexOf(cb)
        if (pos > -1) {
          subscribers.splice(pos, 1)
        }
      }
    },

    unsubscribeAll() {
      subscribers.length = 0
    },
  }
}
