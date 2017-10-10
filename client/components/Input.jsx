import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { styled, mixins } from 'client/utils'

const StyledInput = styled('StyledInput', {
  backgroundColor: '#ffffff',
  display: 'block',
  width: '100%',
  ...mixins.border,

  extend: [
    ...mixins.paddings('all', 'small'),
  ],
}, 'input')

export default class Input extends PureComponent {
  static propTypes = {
    autoFocus: PropTypes.bool,
  }

  ref = null;

  componentDidMount() {
    if (this.props.autoFocus) {
      this.ref.focus()
      const { length } = this.ref.value
      // put cursor at the end of the input
      this.ref.setSelectionRange(length, length)
    }
  }

  render() {
    const { autoFocus, ...props } = this.props
    return <StyledInput innerRef={(ref) => { this.ref = ref }} {...props} />
  }
}
