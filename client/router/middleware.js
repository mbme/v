import generateUrls from 'universal-router/generateUrls' // eslint-disable-line import/extensions
import { PUSH, REPLACE, GO_BACK } from './actions'

export default function routerMiddleware(router) {
  const url = generateUrls(router)

  // eslint-disable-next-line consistent-return
  return () => next => (action) => {
    switch (action.type) {
      case PUSH:
        window.history.pushState(null, '', url(action.name, action.params))
        break

      case REPLACE:
        window.history.replaceState(null, '', url(action.name, action.params))
        break

      case GO_BACK:
        window.history.back()
        break

      default:
        return next(action)
    }
  }
}
