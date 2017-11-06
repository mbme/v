import React from 'react'
import PropTypes from 'prop-types'
import s from 'client/styles'

const Container = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: 'var(--toolbar-height)',
}

const Content = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
}

export default function Toolbar({ left, right }) {
  return (
    <div className={s.cx(Container)}>
      <div className={s.cx(Content)}>
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
