import { getType, isString, isObject, isArray, flatten } from 'shared/utils'

export const RECORD_TYPES = [ 'note' ]

function createObjectValidator(props) {
  return (val) => {
    if (!isObject(val)) return [ `expected object, received ${getType(val)}` ]

    return flatten(Object.entries(props).map(([ prop, typeName ]) => validate(val[prop], typeName))) // eslint-disable-line no-use-before-define
  }
}

const Types = {
  'positive-integer': val => Number.isInteger(val) && val > 0,
  'string': isString,
  'object': isObject,
  'string!': val => isString(val) && val, // not empty string
  'buffer': Buffer.isBuffer,

  'record-type': val => RECORD_TYPES.includes(val),
  'record-id': 'positive-integer',
  'record-name': 'string!',
  'record-data': 'string',

  'file-name': 'string!',
  'file-data': 'buffer',
  'file-id': 'string!', // FIXME sha256

  'NewFile': createObjectValidator({ 'name': 'file-name', 'data': 'file-data' }),
}

/**
 * @param {string} typeName one of Types or type + [] for arrays of types
 */
export function validate(val, typeName) {
  if (typeName.endsWith('[]')) { // handle arrays
    if (!isArray(val)) return [ `expected ${typeName}, received ${getType(val)}` ]

    const childTypeName = typeName.substring(0, typeName.length - 2)
    return flatten(val.map(value => validate(value, childTypeName)))
  }

  const type = Types[typeName]
  if (!type) throw new Error(`unknown type ${typeName}`)

  // type is an alias for other type
  if (isString(type)) return validate(val, type)

  // type is validator function
  const result = type(val)
  if (!result) return [ `expected ${typeName}, received ${getType(val)}` ]

  return isArray(result) ? result : []
}

export function assert(val, typeName) {
  const results = validate(val, typeName)
  if (results.length) throw results
}

export const validateAll = (...rules) => flatten(rules.map(([ val, typeName ]) => validate(val, typeName)))

export function assertAll(...rules) {
  const results = validateAll(...rules)
  if (results.length) throw results
}