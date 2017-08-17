/* eslint-disable react/no-multi-comp */

import React from 'react'
import PropTypes from 'prop-types'
import { asyncWatchChanges } from 'shared/store'
import createApiClient from 'shared/api'

export function connect(initStore) {
  return WrappedComponent =>
    class extends React.Component {
      static displayName = 'Connected' + (WrappedComponent.displayName || WrappedComponent.name || 'Component')

      static contextTypes = {
        client: PropTypes.object.isRequired,
      }

      mounted = false

      componentWillMount() {
        this.store = asyncWatchChanges(initStore(this.context.client), () => {
          if (this.mounted) {
            this.forceUpdate()
          }
        })
      }

      componentDidMount() {
        this.mounted = true
      }

      componentWillUnmount() {
        this.mounted = false
      }

      render() {
        return <WrappedComponent store={this.store} {...this.props} />
      }
    }
}

export class Provider extends React.Component {
  static propTypes = {
    baseUrl: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  }

  static childContextTypes = {
    client: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.client = createApiClient(props.baseUrl)
  }

  getChildContext() {
    return { client: this.client }
  }

  render() {
    return this.props.children
  }
}
