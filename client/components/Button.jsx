import React from 'react'
import PropTypes from 'prop-types'
import s from 'client/styles'
import Icon from './Icon'

const CleanButton = (disabled, primary) => ({
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

  ...s.if(primary && !disabled, {
    color: 'var(--color-primary)',
  }),
})

const FlatButton = (disabled, primary) => ({
  ...CleanButton(disabled, primary),

  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  transition: 'background-color 100ms linear',

  ...s.if(!disabled, {
    ':hover': {
      boxShadow: 'var(--box-shadow)',
    },
  }),
})

const RaisedButton = (disabled, primary) => s.cx(CleanButton(disabled, primary), 'with-border')

export function Button({ onClick, disabled, raised, primary, children }) {
  const className = s.cx(raised ? RaisedButton(disabled, primary) : FlatButton(disabled, primary))
  return (
    <button className={className} onClick={onClick} disabled={disabled}>{children}</button>
  )
}
Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  raised: PropTypes.bool,
  primary: PropTypes.bool,
  children: PropTypes.node.isRequired,
}

export function IconButton({ type, title, onClick, className }) {
  return (
    <button className={s.cx(FlatButton(false), className)} title={title} onClick={onClick}><Icon type={type} /></button>
  )
}
IconButton.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
}
