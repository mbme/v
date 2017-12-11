import { createRenderer } from 'fela'
import { render } from 'fela-dom'
import { isString, isObject } from 'shared/utils'

const renderer = createRenderer()

export const init = () => render(renderer)

function cx(...args) {
  return args.reduce((acc, val) => {
    if (!val) return acc

    if (isString(val)) {
      acc.push(val)
    } else if (isObject(val)) {
      acc.push(renderer.renderRule(() => val))
    }

    return acc
  }, []).join(' ')
}

const animation = keyframe => renderer.renderKeyframe(() => keyframe)

export default {
  cx,
  animation,
  if: (condition, styles, altStyles = {}) => condition ? styles : altStyles,
}
