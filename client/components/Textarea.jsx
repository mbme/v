import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { styled, mixins } from 'client/utils'

const StyledTextarea = styled('StyledTextarea', {
  backgroundColor: '#ffffff',
  display: 'block',
  width: '100%',
  minHeight: '300px',
  ...mixins.border,

  resize: 'none',
  overflowY: 'hidden',

  extend: [
    ...mixins.paddings('all', 'medium'),
  ],
}, 'textarea')

export default class Textarea extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  ref = null

  saveRef = (ref) => {
    this.ref = ref
  }

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

  render() {
    const { name, value, onChange } = this.props

    return (
      <StyledTextarea innerRef={this.saveRef} name={name} onChange={onChange} value={value} />
    )
  }
}
