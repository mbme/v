const check = (result, msg) => result ? null : msg
const getType = val => Object.prototype.toString.call(val)
const isString = val => typeof val === 'string'

const RECORD_TYPES = ['note']

// each validator could return undefined, string or string[]
const validators = {
  record: {
    id (id) {
      return check(
        Number.isInteger(id) && id > 0,
        `record id: expected positive integer, received ${id}`
      )
    },
    type (type) {
      return check(
        RECORD_TYPES.indexOf(type) >= 0,
        `record type: expected one of ${RECORD_TYPES}, received ${type}`
      )
    },
    name (name) {
      return check(isString(name), `record name: expected string, received ${getType(name)}`)
    },
    data (data) {
      return check(isString(data), `record data: expected string, received ${getType(data)}`)
    },
  },
  file: {
    name (name) {
      return check(isString(name), `file name: expected string, received ${getType(name)}`)
    },
    data (data) {
      return check(Buffer.isBuffer(data), `file data: expected Buffer, received ${getType(data)}`)
    },
  },
}

function validate (...validators) {
  // flatten arrays and skip empty items
  const results = validators.reduce((acc, val) => acc.concat(val), []).filter(result => !!result)

  if (results.length) {
    throw results
  }
}

module.exports = { validators, validate }
