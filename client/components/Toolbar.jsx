import React from 'react'
import PropTypes from 'prop-types'
import { styled, mixins, theme } from 'client/utils'
import { Flex } from 'client/components'

const ToolbarContainer = styled('ToolbarContainer', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: theme.toolbarHeight,
})

const Content = styled('Content', {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',

  backgroundColor: '#fff',

  height: '100%',
  ...mixins.limitWidth,
  margin: '0 auto',
})

export default function Toolbar({ left, right }) {
  return (
    <ToolbarContainer>
      <Content>
        <Flex>{left}</Flex>
        <Flex>{right}</Flex>
      </Content>
    </ToolbarContainer>
  )
}

Toolbar.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
}
