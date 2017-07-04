import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-fela'

const SIZE = {
  small: 'small',
  medium: 'medium',
  large: 'large',
  giant: 'giant',
}

const icon = ({ size = SIZE.medium }) => ({
  extend: [
    {
      condition: size === SIZE.small,
      style: {
        fontSize: 18,
      },
    },
    {
      condition: size === SIZE.medium,
      style: {
        fontSize: 24,
      },
    },
    {
      condition: size === SIZE.large,
      style: {
        fontSize: 36,
      },
    },
    {
      condition: size === SIZE.giant,
      style: {
        fontSize: 48,
      },
    },
  ],
})

/**
 * @see http://google.github.io/material-design-icons/#icon-font-for-the-web
 */
function Icon ({ name, size, styles }) {
  return (
    <i className={'material-icons ' + styles.icon}>{name}</i>
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOf(Object.values(SIZE)),
  styles: PropTypes.object.isRequired,
}

export default connect({ icon })(Icon)
