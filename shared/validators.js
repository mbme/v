import { getIn, getType, isString, isObject, isFunction } from 'shared/utils'

const RECORD_TYPES = [ 'note' ]

const Types = {
  'positive-integer': val => Number.isInteger(val) && val > 0,
  'record-type': val => RECORD_TYPES.includes(val),
  'string': isString,
  'buffer': Buffer.isBuffer,
  'Record': {
    id: 'positive-integer',
    type: 'record-type',
    name: 'string',
    data: 'string',
  },
  'File': {
    name: 'string',
    data: 'buffer',
  },
}

/**
 * @prop typeName Type name like "Record" or "Record.id"
 */
export function validate(val, typeName, prefix = '') {
  const type = getIn(Types, typeName)
  if (!type) {
    throw new Error(`validateSchema: unknown type ${typeName}`)
  }

  if (isString(type)) { // type is an alias of other type
    return validate(val, type, prefix)
  }

  if (isFunction(type)) { // type is validator function
    if (type(val)) {
      return []
    }

    return [ `${prefix}: expected ${typeName}, received ${getType(val)}` ]
  }

  if (isObject(type)) { // type is an object
    if (!isObject(val)) {
      return [ `Expected ${typeName}(object), received ${getType(val)}` ]
    }

    const messages = []

    Object.keys(type).forEach((prop) => {
      messages.push(...validate(val[prop], type[prop], `${prefix}.${prop}`, messages))
    })

    return messages
  }

  throw new Error(`validateSchema: unknown type test ${getType(type)}`)
}

export function validateAndThrow(...rules) {
  const results = []

  rules.forEach(([ val, typeName ]) => results.push(...validate(val, typeName)))

  if (results.length) {
    throw results
  }
}
