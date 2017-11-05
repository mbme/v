import React from 'react'
import PropTypes from 'prop-types'
import styles from 'client/styles'
import Icon from './Icon'

export default function IconButton({ type, onClick }) {
  return (
    <button className={styles.FlatButton} onClick={onClick}><Icon type={type} /></button>
  )
}

IconButton.propTypes = {
  type: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}
