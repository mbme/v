/* eslint-disable quote-props */

import { isString } from 'shared/utils'

const cx = (...args) => args.filter(arg => arg && isString(arg)).join(' ') // FIXME implement actual rendering

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
  fontSize: 'var(--font-size-large)',
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
  if: (condition, styles) => condition ? styles : {},
}
