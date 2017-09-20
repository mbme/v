import React from 'react'
import PropTypes from 'prop-types'
import { styled, mixins, theme } from 'client/utils'

export const ToolbarContainer = styled('ToolbarContainer', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: theme.TOOLBAR_HEIGHT,

  backgroundColor: '#fff',

  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
})

export default function Toolbar({ left, right }) {
  return (
    <ToolbarContainer>
      <div>{left}</div>
      <div>{right}</div>
    </ToolbarContainer>
  )
}

Toolbar.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
}
