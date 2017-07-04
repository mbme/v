import React from 'react'
import PropTypes from 'prop-types'

import { ripple } from 'material-components-web'

class Button extends React.Component {
  buttonRef = null

  componentDidMount () {
    ripple.MDCRipple.attachTo(this.buttonRef)
  }

  render () {
    const { className, ...props } = this.props

    return (
      <button ref={(ref) => { this.buttonRef = ref }} className={'mdc-button ' + className} {...props} />
    )
  }
}

Button.propTypes = {
  className: PropTypes.string,
}

export default Button
