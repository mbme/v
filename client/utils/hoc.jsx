/* eslint-disable react/no-multi-comp */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

/* eslint-disable import/extensions */
import Router from 'universal-router'
import generateUrls from 'universal-router/generateUrls'
/* eslint-enable import/extensions */

import { createSubject, isFunction } from 'shared/utils'
import createApiClient from 'shared/api'

export default class VProvider extends Component {
  static propTypes = {
    baseUrl: PropTypes.string.isRequired,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
    children: PropTypes.node.isRequired,
  }

  static childContextTypes = {
    router: PropTypes.object.isRequired,
    view$: PropTypes.object.isRequired,
    modal$: PropTypes.object.isRequired,
  }

  client = null
  view$ = null
  modal$ = null
  router = null
  stores = null
  scrollPos = null

  constructor(props) {
    super(props)

    this.client = createApiClient(props.baseUrl)
    this.view$ = createSubject(null)
    this.modal$ = createSubject(null)
    this.stores = {}
    this.scrollPos = {}

    // Switch off the native scroll restoration behavior and handle it manually
    // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }

  componentWillMount() {
    this.router = this.createRouter(this.props.routes)
    this.router.start()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.routes !== nextProps.routes) {
      this.router.stop() // stop previous router

      this.router = this.createRouter(nextProps.routes)
      this.router.start()
    }
  }

  componentWillUnmount() {
    this.router.stop()
    this.view$.unsubscribeAll()
    this.modal$.unsubscribeAll()
  }

  getChildContext() {
    return { router: this.router, view$: this.view$, modal$: this.modal$ }
  }

  createRouter(routes) {
    const { stores, view$, client, scrollPos } = this

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
    let currentLocation = window.location.pathname

    async function onLocationChange(isPush) {
      scrollPos[currentLocation] = { offsetX: window.pageXOffset, offsetY: window.pageYOffset }
      currentLocation = window.location.pathname

      const view = await router.resolve(currentLocation)
      view$.next(view)

      if (isPush) {
        delete scrollPos[currentLocation] // delete stored scroll position for the next page
        window.scrollTo(0, 0)
      } else {
        const { offsetX, offsetY } = scrollPos[currentLocation] || { offsetX: 0, offsetY: 0 }
        window.scrollTo(offsetX, offsetY)
      }
    }

    const onPopState = () => onLocationChange(false)

    return {
      start() {
        onLocationChange(false)
        window.addEventListener('popstate', onPopState)
      },

      async push(name, params) {
        window.history.pushState(null, '', url(name, params))
        onLocationChange(true)
      },

      back() {
        window.history.back()
      },

      stop() {
        window.removeEventListener('popstate', onPopState)
      },
    }
  }

  render() {
    return this.props.children
  }
}
