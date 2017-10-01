import Router from 'universal-router' // eslint-disable-line import/extensions
import generateUrls from 'universal-router/generateUrls' // eslint-disable-line import/extensions
import { LOCATION_CHANGE, GO, GO_FORWARD, PUSH, REPLACE, GO_BACK, propagateCurrentLocation } from './actions'

export default function routerMiddleware(routes) {
  const router = new Router(routes)
  const url = generateUrls(router, {
    stringifyQueryParams(params) { // treat unexpected params as query params
      return Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
    },
  })

  // eslint-disable-next-line consistent-return
  return (store) => {
    // handle browser back/forward buttons, and history.back()/forward()/go()
    window.addEventListener('popstate', () => store.dispatch(propagateCurrentLocation()))

    return next => (action) => { // eslint-disable-line consistent-return
      switch (action.type) {
        case PUSH:
          window.history.pushState(null, '', url(action.name, action.params))
          store.dispatch(propagateCurrentLocation(true))
          break

        case REPLACE:
          window.history.replaceState(null, '', url(action.name, action.params))
          store.dispatch(propagateCurrentLocation(true))
          break

        case GO:
          window.history.go(action.pos)
          break

        case GO_BACK:
          window.history.back()
          break

        case GO_FORWARD:
          window.history.forward()
          break

        case LOCATION_CHANGE:
          // add view property to the LOCATION_CHANGE event
          router.resolve(action.pathname).then(view => next({ ...action, view }))
          break

        default:
          return next(action)
      }
    }
  }
}
