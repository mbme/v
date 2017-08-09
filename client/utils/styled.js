import { createComponentWithProxy } from 'react-fela'
import { isFunction } from './utils'

export function styled(styles, type = 'div') {
  const rule = isFunction(styles) ? styles : () => styles

  return createComponentWithProxy(rule, type)
}

export const mixins = {
  border: {
    border: '1px solid #f5f5f5',
  },
}
