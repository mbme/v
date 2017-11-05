import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class Textarea extends PureComponent {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  ref = null
  selectionStart = 0
  selectionEnd = 0

  updateHeight = () => {
    this.ref.style.height = 'auto'
    this.ref.style.height = this.ref.scrollHeight + 'px'
  }

  componentDidMount() {
    this.updateHeight() // TODO handle window resize
  }

  componentDidUpdate() {
    this.updateHeight()
  }

  onBlur = () => {
    this.selectionStart = this.ref.selectionStart
    this.selectionEnd = this.ref.selectionEnd
  }

  insert(str) {
    const { value, onChange } = this.props

    this.ref.value = `${value.substring(0, this.selectionStart)}${str}${value.substring(this.selectionEnd)}`

    this.selectionStart += str.length
    this.selectionEnd = this.selectionStart

    this.ref.setSelectionRange(this.selectionStart, this.selectionEnd)

    onChange(this.ref.value)
  }

  focus() {
    this.ref.focus()
  }

  render() {
    const { name, value, onChange } = this.props

    return (
      <textarea
        className="StyledTextarea with-border"
        ref={(ref) => { this.ref = ref }}
        name={name}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={this.onBlur}
      />
    )
  }
}
