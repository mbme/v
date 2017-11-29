import { createRenderer } from 'fela'
import { render } from 'fela-dom'
import { isString, isObject } from 'shared/utils'

const renderer = createRenderer()

export const init = () => render(renderer)

function cx(...args) {
  return args.reduce((acc, val) => {
    if (!val) {
      return acc
    }

    if (isString(val)) {
      acc.push(val)
    } else if (isObject(val)) {
      acc.push(renderer.renderRule(() => val))
    }

    return acc
  }, []).join(' ')
}

const animation = keyframe => renderer.renderKeyframe(() => keyframe)

const withBorder = {
  border: 'var(--border)',
  boxShadow: 'var(--box-shadow)',
}

const Paper = {
  ...withBorder,
  backgroundColor: 'var(--bg-light)',
  borderRadius: '2px',
  padding: 'var(--spacing-medium)',
}

const Heading = {
  fontWeight: 'bold',
  fontSize: 'var(--font-size-xlarge)',
  marginBottom: 'var(--spacing-medium)',
}

const ViewContainer = {
  display: 'flex',
  flexDirection: 'column',
}

export default {
  Paper: cx(Paper),
  Heading: cx(Heading),
  ViewContainer: cx(ViewContainer),
  withBorder,
  cx,
  animation,
  if: (condition, styles, altStyles = {}) => condition ? styles : altStyles,
}
