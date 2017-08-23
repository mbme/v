/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

/* eslint-disable import/extensions */
import Router from 'universal-router'
import generateUrls from 'universal-router/generateUrls'
/* eslint-enable import/extensions */

import { observable } from 'shared/utils'
import { asyncWatchChanges } from 'shared/store'
import createApiClient from 'shared/api'

function createRouter(routes, view$) {
  const router = new Router(routes)
  const url = generateUrls(router)

  router.resolve(window.location.pathname).then(view => view$.set(view))

  return {
    async push(name, params) {
      const pathname = url(name, params)

      const view = await router.resolve(pathname)

      window.history.pushState(null, '', pathname)
      view$.set(view)
    },
  }
}

export function connect(initStore) {
  return WrappedComponent =>
    class extends React.Component {
      static displayName = 'Connected' + (WrappedComponent.displayName || WrappedComponent.name || 'Component')

      static contextTypes = {
        client: PropTypes.object.isRequired,
      }

      mounted = false
      store = undefined

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

export class VProvider extends Component {
  static propTypes = {
    baseUrl: PropTypes.string.isRequired,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
    children: PropTypes.node.isRequired,
  }

  static childContextTypes = {
    client: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    view$: PropTypes.object.isRequired,
  }

  client = null
  view$ = null
  router = null

  constructor(props) {
    super(props)

    this.client = createApiClient(props.baseUrl)
    this.view$ = observable(null)
    this.router = createRouter(props.routes, this.view$)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.routes !== nextProps.routes) {
      this.router = createRouter(nextProps.routes, this.view$)
    }
  }

  componentWillUnmount() {
    this.view$.unsubscribeAll()
  }

  getChildContext() {
    return { client: this.client, router: this.router, view$: this.view$ }
  }

  render() {
    return this.props.children
  }
}
