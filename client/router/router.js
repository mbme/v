import Router from 'universal-router'
import generateUrls from 'universal-router/generateUrls'

export default function createRouter(routes) {
  let routingSequence

  const router = new Router(routes, {
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

      return undefined
    },
  })

  const url = generateUrls(router, {
    stringifyQueryParams(params) { // treat unexpected params as query params
      return Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
    },
  })

  return {
    getUrl(name, params) {
      return url(name, params)
    },

    resolve(pathname) {
      return router.resolve(pathname).then(resp => ({ ...resp, routingSequence }))
    },
  }
}
