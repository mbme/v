/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

/* eslint-disable import/extensions */
import Router from 'universal-router'
import generateUrls from 'universal-router/generateUrls'
/* eslint-enable import/extensions */

import { createSubject, isFunction } from 'shared/utils'
import { createAsyncStore } from 'shared/store'
import createApiClient from 'shared/api'

export class Link extends Component {
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

export function observeStore(WrappedComponent) {
  return class extends Component {
    static displayName = 'Connected' + (WrappedComponent.displayName || WrappedComponent.name || 'Component')

    static propTypes = {
      store$: PropTypes.object.isRequired,
    }

    componentWillMount() {
      this.unsubscribe = this.props.store$.subscribe(() => this.forceUpdate())
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    render() {
      const { store$, ...otherProps } = this.props
      return <WrappedComponent store={store$.value} {...otherProps} />
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
    router: PropTypes.object.isRequired,
    view$: PropTypes.object.isRequired,
  }

  client = null
  view$ = null
  router = null
  stores = null

  constructor(props) {
    super(props)

    this.client = createApiClient(props.baseUrl)
    this.view$ = createSubject(null)
    this.stores = {}
    this.router = this.createRouter(props.routes)
  }

  componentWillMount() {
    window.addEventListener('popstate', this.updateRouter)
    this.updateRouter()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.routes !== nextProps.routes) {
      this.router = this.createRouter(nextProps.routes)
      this.updateRouter()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.updateRouter)
    this.view$.unsubscribeAll()
  }

  getChildContext() {
    return { router: this.router, view$: this.view$ }
  }

  createRouter(routes) {
    const { stores, view$, client } = this

    const router = new Router(routes, {
      context: { stores },
      resolveRoute(context, params) {
        const { action, store } = context.route

        if (store && !stores[store.name]) {
          stores[store.name] = createAsyncStore(store.init(client))
        }

        if (isFunction(action)) {
          return action(context, params)
        }

        return null
      },
    })

    const url = generateUrls(router)

    return {
      async push(name, params) {
        const pathname = url(name, params)

        const view = await router.resolve(pathname)

        window.history.pushState(null, '', pathname)
        view$.next(view)
      },

      async useCurrentPath() {
        const view = await router.resolve(window.location.pathname)
        view$.next(view)
      },
    }
  }

  updateRouter = () => {
    if (this.router) {
      this.router.useCurrentPath()
    }
  }

  render() {
    return this.props.children
  }
}
