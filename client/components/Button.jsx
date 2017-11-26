import React from 'react'
import PropTypes from 'prop-types'
import s from 'client/styles'
import Icon from './Icon'

const CleanButton = disabled => ({
  border: '0 none',
  borderRadius: '2px',
  cursor: 'pointer',
  userSelect: 'none',
  backgroundColor: 'inherit',
  padding: 'var(--spacing-fine) var(--spacing-medium)',

  ...s.if(disabled, {
    cursor: 'auto',
    filter: 'invert(80%)',
  }),
})

const FlatButton = disabled => ({
  ...CleanButton(disabled),

  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  transition: 'background-color 100ms linear',

  ...s.if(!disabled, {
    ':hover': {
      backgroundColor: 'gray',
    },
  }),
})

const RaisedButton = disabled => ({
  ...CleanButton(disabled),
  ...s.withBorder,
})

export function Button({ onClick, disabled, raised, children }) {
  const className = s.cx(raised ? RaisedButton(disabled) : FlatButton(disabled))
  return (
    <button className={className} onClick={onClick} disabled={disabled}>{children}</button>
  )
}
Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  raised: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

export function IconButton({ type, onClick }) {
  return (
    <button className={s.cx(FlatButton(false))} onClick={onClick}><Icon type={type} /></button>
  )
}
IconButton.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}
