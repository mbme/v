import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import s from 'client/styles'

const Styles = {
  display: 'block',
  width: '100%',
}

const FormInputStyles = s.cx({
  ...Styles,
  backgroundColor: 'var(--bg-color)',
  padding: 'var(--spacing-small)',
}, 'with-border')

const LightInputStyles = {
  ...Styles,
  border: '0 none',
  borderBottom: 'var(--border)',
  backgroundColor: 'inherit',
  padding: 'var(--spacing-fine) var(--spacing-small)',
}

class Input extends PureComponent {
  static propTypes = {
    autoFocus: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  }

  ref = null

  componentDidMount() {
    if (this.props.autoFocus) {
      this.ref.focus()
      const { length } = this.ref.value
      this.ref.setSelectionRange(length, length) // put cursor at the end of the input
    }
  }

  render() {
    const { onChange, ...other } = this.props
    return (
      <input
        ref={(ref) => { this.ref = ref }}
        onChange={e => onChange(e.target.value)}
        {...other}
      />
    )
  }
}

export function FormInput({ className, ...other }) {
  return <Input className={s.cx(className, FormInputStyles)} {...other} />
}

FormInput.propTypes = {
  className: PropTypes.string,
}

export function LightInput({ className, ...other }) {
  return <Input className={s.cx(className, LightInputStyles)} {...other} />
}

LightInput.propTypes = {
  className: PropTypes.string,
}
