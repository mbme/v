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
  const type = getType(elem)
  return type === 'Function' || type === 'AsyncFunction'
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

export function capitalize(str) {
  return str[0].toUpperCase() + str.substring(1)
}

export function createArray(size, val) {
  const arr = Array(size)
  if (isFunction(val)) {
    return arr.fill(0).map((_, i) => val(i))
  }

  return arr.fill(val)
}

// recursive helper for `getIn`
function getInRec(obj, [ prop, ...rest ]) {
  if (!rest.length) {
    return obj[prop]
  }

  return getInRec(obj[prop], rest)
}

export function getIn(obj, propName) {
  return getInRec(obj, propName.split('.'))
}

/**
 * Create new object with specified prototype `proto` and custom `props`
 */
export function extend(proto, props) {
  const propertiesObject = {}

  Object.keys(props).forEach((prop) => {
    propertiesObject[prop] = { value: props[prop] }
  })

  return Object.create(proto, propertiesObject)
}

export function createSubject(initialValue) {
  const subscribers = []

  let currentValue = initialValue

  return {
    get value() {
      return currentValue
    },

    next(value) {
      currentValue = value
      subscribers.forEach(cb => cb(value))
    },

    subscribe(cb) {
      subscribers.push(cb)

      return () => this.unsubscribe(cb)
    },

    unsubscribe(cb) {
      const pos = subscribers.indexOf(cb)
      if (pos > -1) {
        subscribers.splice(pos, 1)
      }
    },

    unsubscribeAll() {
      subscribers.length = 0
    },
  }
}

function bytesToHexString(buffer) {
  return Array.from(new Uint8Array(buffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('')
}

export function sha256(buffer) {
  return crypto.subtle.digest('SHA-256', buffer).then(bytesToHexString)
}
