import { getType, isString, isObject, isFunction } from 'utils/utils'

const RECORD_TYPES = ['note']

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

// TODO handle Record.type, File.data etc
export function validate(val, typeName, prefix = '') {
  const type = Types[typeName]
  if (!type) {
    throw new Error(`validateSchema: unknown type ${typeName}`)
  }

  if (isFunction(type)) {
    if (type(val)) {
      return []
    }

    return [`${prefix}: expected ${typeName}, received ${getType(val)}`]
  }

  if (isObject(type)) {
    if (!isObject(val)) {
      return [`Expected ${typeName}(object), received ${getType(val)}`]
    }

    const messages = []

    Object.keys(type).forEach((prop) => {
      messages.push(
        ...validate(val[prop], type[prop], `${prefix}.${prop}`, messages)
      )
    })

    return messages
  }

  throw new Error(`validateSchema: unknown type test ${getType(type)}`)
}

export function validateAndThrow(...args) {
  const messages = validate(...args)
  if (messages.length) {
    throw messages
  }
}
