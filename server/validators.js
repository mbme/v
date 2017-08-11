import { getType, isString } from 'utils/utils'

const check = (result, msg) => result ? null : msg

const RECORD_TYPES = ['note']

// each validator could return undefined, string or string[]
export const validators = {
  record: {
    id(id) {
      return check(
        Number.isInteger(id) && id > 0,
        `record id: expected positive integer, received "${id}"`
      )
    },
    type(type) {
      return check(
        RECORD_TYPES.indexOf(type) >= 0,
        `record type: expected one of ${RECORD_TYPES}, received "${type}"`
      )
    },
    name(name) {
      return check(isString(name), `record name: expected string, received "${getType(name)}"`)
    },
    data(data) {
      return check(isString(data), `record data: expected string, received "${getType(data)}"`)
    },
  },
  file: {
    name(name) {
      return check(isString(name), `file name: expected string, received "${getType(name)}"`)
    },
    data(data) {
      return check(Buffer.isBuffer(data), `file data: expected Buffer, received "${getType(data)}"`)
    },
  },
}

export function validate(...results) {
  // flatten arrays and skip empty items
  const flatResults = results.reduce((acc, val) => acc.concat(val), []).filter(result => !!result)

  if (flatResults.length) {
    throw flatResults
  }
}
