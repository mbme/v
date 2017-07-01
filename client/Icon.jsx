import React from 'react'
import PropTypes from 'prop-types'

/**
 * @see http://google.github.io/material-design-icons/#icon-font-for-the-web
 */
export default function Icon ({ name }) {
  return (
    <i className="material-icons">{name}</i>
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
}
