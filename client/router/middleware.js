import { LOCATION_CHANGE, PUSH, REPLACE, propagateCurrentLocation, replace, setView } from './actions'

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

        case LOCATION_CHANGE:
          router.resolve(action.pathname).then((resp) => {
            if (resp.redirectTo) {
              store.dispatch(replace(resp.redirectTo))
              return
            }

            next(action)

            const initPromise = resp.init ? resp.init(store, resp.params) : Promise.resolve()

            initPromise.then(
              () => resp.render(resp.params),
              (e) => {
                console.error(e)
                return null
              },
            ).then(
              view => store.dispatch(setView(view, resp.routingSequence)),
            )
          })
          break

        default:
          return next(action)
      }
    }
  }
}
