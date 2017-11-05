import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class Input extends PureComponent {
  static propTypes = {
    autoFocus: PropTypes.bool,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
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
    const { name, value, defaultValue, placeholder, onChange } = this.props
    return (
      <input
        className="StyledInput with-border"
        ref={(ref) => { this.ref = ref }}
        type="text"
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    )
  }
}
