import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

export default class Link extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      params: PropTypes.object,
    }).isRequired,
    children: PropTypes.node.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  onClick = () => {
    const { name, params } = this.props.to
    this.context.router.push(name, params)
  }

  render() {
    const { className, children } = this.props

    return (
      <div className={className} role="link" tabIndex="0" onClick={this.onClick}>{children}</div>
    )
  }
}
