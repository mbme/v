import React from 'react'
import PropTypes from 'prop-types'
import feather from 'feather-icons'

export default function Icon({ type }) {
  const svg = feather.toSvg(type, { fill: 'white' })

  return (
    <div dangerouslySetInnerHTML={{ __html: svg }} /> // eslint-disable-line react/no-danger
  )
}

Icon.propTypes = {
  type: PropTypes.string.isRequired,
}
