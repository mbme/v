import React from 'react'
import PropTypes from 'prop-types'
import s from 'client/styles'

const Content = s.cx({
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'sticky',
  top: 0,
  backgroundColor: 'var(--bg-color)',
  padding: 'var(--spacing-fine) 0',
})

export default function Toolbar({ left, right }) {
  return (
    <div className={Content}>
      <div className="flex">{left}</div>
      <div className="flex">{right}</div>
    </div>
  )
}

Toolbar.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
}
