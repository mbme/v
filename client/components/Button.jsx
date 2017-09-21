/* eslint quote-props: ["error", "as-needed"] */

import React from 'react'
import PropTypes from 'prop-types'
import { styled, mixins } from 'client/utils'
import Icon from './Icon'

const CleanButton = styled('CleanButton', {
  border: '0 none',
  borderRadius: 2,

  cursor: 'pointer',
  userSelect: 'none',

  extend: [
    ...mixins.paddings('horizontal', 'medium'),
    ...mixins.paddings('vertical', 'fine'),
  ],
}, 'button')

export const FlatButton = styled('FlatButton', {
  textTransform: 'uppercase',
  letterSpacing: '1.2px',

  transition: 'background-color 100ms linear',
  ':hover': {
    backgroundColor: 'gray',
  },
}, CleanButton)

export const RaisedButton = styled('RaisedButton', {
  ...mixins.border,
}, FlatButton)


export function IconButton({ type, onClick }) {
  return (
    <FlatButton onClick={onClick}><Icon type={type} /></FlatButton>
  )
}

IconButton.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}
