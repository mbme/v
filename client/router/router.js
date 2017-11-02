import Router from 'universal-router' // eslint-disable-line import/extensions
import generateUrls from 'universal-router/generateUrls' // eslint-disable-line import/extensions

export default function createRouter() {
  let router
  let url
  let routingSequence

  return {
    useRoutes(routes) {
      router = new Router(routes, {
        resolveRoute({ route }, params) {
          if (!route.parent) {
            routingSequence = []
          } else {
            routingSequence.push(route.name)
          }

          if (route.redirectTo) {
            return { redirectTo: route.redirectTo }
          }

          if (route.render) {
            return { render: route.render, init: route.init, params }
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
      return router.resolve(pathname).then(resp => ({ ...resp, routingSequence }))
    },
  }
}