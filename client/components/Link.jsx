import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as routerActions from 'client/router/actions'

class Link extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      params: PropTypes.object,
    }).isRequired,
    children: PropTypes.node.isRequired,
    push: PropTypes.func.isRequired,
  }

  onClick = () => {
    const { name, params } = this.props.to
    this.props.push(name, params)
  }

  render() {
    const { className, children } = this.props

    return (
      <div className={className} role="link" tabIndex="0" onClick={this.onClick}>{children}</div>
    )
  }
}

const mapDispatchToProps = {
  push: routerActions.push,
}

export default connect(null, mapDispatchToProps)(Link)
