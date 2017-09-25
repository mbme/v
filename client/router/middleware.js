import generateUrls from 'universal-router/generateUrls' // eslint-disable-line import/extensions
import { GO, GO_FORWARD, PUSH, REPLACE, GO_BACK, propagateCurrentLocation } from './actions'

export default function routerMiddleware(router) {
  const url = generateUrls(router)

  // eslint-disable-next-line consistent-return
  return () => next => (action) => {
    switch (action.type) {
      case PUSH:
        window.history.pushState(null, '', url(action.name, action.params))
        return next(propagateCurrentLocation(true))

      case REPLACE:
        window.history.replaceState(null, '', url(action.name, action.params))
        return next(propagateCurrentLocation(true))

      case GO:
        window.history.go(action.pos)
        break

      case GO_BACK:
        window.history.back()
        break

      case GO_FORWARD:
        window.history.forward()
        break

      default:
        return next(action)
    }
  }
}
