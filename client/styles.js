import { isObject, isFunction } from './utils'

export default function styles (style) {
  let rule

  if (isObject(style)) {
    rule = () => style
  } else if (isFunction(style)) {
    rule = style
  } else {
    throw new Error("'style' must be an object or a function")
  }

  return props => window.renderer.renderRule(rule, props)
}
