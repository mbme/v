export const getType = elem => Object.prototype.toString.call(elem).slice(8, -1)

export const isObject = elem => getType(elem) === 'Object'
export const isArray = elem => getType(elem) === 'Array'
export const isString = elem => getType(elem) === 'String'
export const isFunction = elem => [ 'Function', 'AsyncFunction' ].includes(getType(elem))

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

export const capitalize = str => str[0].toUpperCase() + str.substring(1)

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

export const getIn = (obj, path) => getInRec(obj, path.split('.'))

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

export function uniq(arr, getKey = val => val) {
  const result = []
  const keys = []

  arr.forEach((item) => {
    const key = getKey(item)

    if (!keys.includes(key)) {
      result.push(item)
      keys.push(key)
    }
  })

  return result
}

// TODO remove
export const groupBy = (arr, getKey) => arr.reduce((acc, value) => {
  const key = getKey(value)
  const group = acc[key] || []
  group.push(value)

  acc[key] = group

  return acc
}, {})

// inclusive ? [min, max] : [min, max)
export const randomInt = (min, max, inclusive = true) => Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0)) + min) // eslint-disable-line no-mixed-operators

export function shuffle(array) {
  const result = array.slice(0)

  for (let i = 0; i < array.length; i += 1) {
    const index = randomInt(i, array.length, false)

    // swap items
    const item = result[index]
    result[index] = result[i]
    result[i] = item
  }

  return result
}

export const isSha256 = str => /^[a-f0-9]{64}$/i.test(str)
