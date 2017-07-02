function getType (elem) {
  return Object.prototype.toString.call(elem).slice(8, -1)
}

export function isObject (elem) {
  return getType(elem) === 'Object'
}

export function isArray (elem) {
  return getType(elem) === 'Array'
}

export function isFunction (elem) {
  return getType(elem) === 'Function'
}
