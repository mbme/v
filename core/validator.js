import * as utils from '../shared/utils';

const Types = {
  'positive-integer': val => Number.isInteger(val) && val > 0,
  'non-negative-integer': val => Number.isInteger(val) && val >= 0,
  'string': utils.isString,
  'object': utils.isObject,
  'string!': val => utils.isString(val) && val, // not empty string
  'buffer': Buffer.isBuffer,
  'function': utils.isFunction,
  'async-function': utils.isAsyncFunction,
  'sha256': val => utils.isString(val) && utils.isSha256(val),

  'file-name': 'string!',
  'file-data': 'buffer',
  'file-id': 'sha256',

  'record-type': 'string!',
  'record-id': 'positive-integer',
  'record-fields': 'object',
};

/**
 * @param {string} typeName one of Types or type + [] for arrays of types
 */
export function validate(val, typeName, validators = {}) {
  if (typeName.endsWith('[]')) { // handle arrays
    if (!utils.isArray(val)) return [ `expected ${typeName}, received ${utils.getType(val)}` ];

    const childTypeName = typeName.substring(0, typeName.length - 2);
    return utils.flatten(val.map(value => validate(value, childTypeName)));
  }

  const type = validators[typeName] || Types[typeName];
  if (!type) throw new Error(`unknown type ${typeName}`);

  // type is an alias for other type
  if (utils.isString(type)) return validate(val, type);

  // type is validator function
  const result = type(val);
  if (!result) return [ `expected ${typeName}, received ${utils.getType(val)}` ];

  return utils.isArray(result) ? result : [];
}

export function assert(...params) {
  const results = validate(...params);
  if (results.length) throw results;
}

export const validateAll = (...rules) => utils.flatten(rules.map(params => validate(...params)));

export function assertAll(...rules) {
  const results = validateAll(...rules);
  if (results.length) throw results;
}

export function createObjectValidator(props) {
  return (val) => {
    if (!utils.isObject(val)) return [ `expected object, received ${utils.getType(val)}` ];

    return utils.flatten(Object.entries(props).map(([ prop, typeName ]) => validate(val[prop], typeName)));
  };
}
