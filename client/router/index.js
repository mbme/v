import Router from 'universal-router' // eslint-disable-line import/extensions
import generateUrls from 'universal-router/generateUrls' // eslint-disable-line import/extensions

export { default as routerMiddleware } from './middleware'
export { propagateCurrentLocation } from './actions'

export default function createRouter() {
  let router
  let url
  let routingSequence

  return {
    useRoutes(routes) {
      router = new Router(routes, {
        resolveRoute(context, params) {
          if (!context.route.parent) {
            routingSequence = []
          } else {
            routingSequence.push(context.route.name)
          }

          if (typeof context.route.action === 'function') {
            return context.route.action(context, params)
          }

          return null
        },
      })

      url = generateUrls(router, {
        stringifyQueryParams(params) { // treat unexpected params as query params
          return Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
        },
      })
    },

    getUrl(name, params) {
      return url(name, params)
    },

    resolve(pathname) {
      return router.resolve(pathname).then(view => ({ view, routingSequence }))
    },
  }
}
