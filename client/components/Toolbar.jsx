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
}, 'section')

const Cell = 'flex flex-center flex-align-center'

export default function Toolbar({ left, right }) {
  return (
    <div className={Content}>
      <div className={Cell}>{left}</div>
      <div className={Cell}>{right}</div>
    </div>
  )
}

Toolbar.propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
}
