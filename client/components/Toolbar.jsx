import React from 'react'
import PropTypes from 'prop-types'

export default function Toolbar({ left, right }) {
  return (
    <div className="ToolbarContainer">
      <div className="ToolbarContent">
        <div className="flex">{left}</div>
        <div className="flex">{right}</div>
      </div>
    </div>
  )
}

Toolbar.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
}
