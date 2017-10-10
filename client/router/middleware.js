import { LOCATION_CHANGE, GO, GO_FORWARD, PUSH, REPLACE, GO_BACK, propagateCurrentLocation, replace } from './actions'

export default function routerMiddleware(router) {
  return (store) => {
    // handle browser back/forward buttons, and history.back()/forward()/go()
    window.addEventListener('popstate', () => store.dispatch(propagateCurrentLocation()))

    return next => (action) => { // eslint-disable-line consistent-return
      switch (action.type) {
        case PUSH:
          window.history.pushState(null, '', router.getUrl(action.name, action.params))
          store.dispatch(propagateCurrentLocation(true))
          break

        case REPLACE:
          window.history.replaceState(null, '', router.getUrl(action.name, action.params))
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
          // add view & routingSequence properties to the LOCATION_CHANGE event
          router.resolve(action.pathname).then(({ view, routingSequence, redirectTo }) => {
            if (redirectTo) {
              store.dispatch(replace(redirectTo))
            } else {
              next({ ...action, view, routingSequence: [ ...routingSequence ] })
            }
          })
          break

        default:
          return next(action)
      }
    }
  }
}
