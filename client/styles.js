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
  border: '1px solid rgba(0,0,0,.09)',
  boxShadow: '0 1px 4px rgba(0,0,0,.04)',
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
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: 'var(--toolbar-height)',
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
