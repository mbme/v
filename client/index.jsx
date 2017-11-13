import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { Provider } from 'react-redux'

import createApiClient from 'shared/api'
import browserApiClient from './utils/apiClient'
import { createRouter, routes, routerMiddleware, propagateCurrentLocation } from './router'
import rootReducer from './reducers'
import App from './chrome/App'
import { init as initStyles } from './styles'

initStyles()

const router = createRouter()
router.useRoutes(routes)

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(createApiClient('', browserApiClient)),
    routerMiddleware(router),
  ),
)
store.dispatch(propagateCurrentLocation()) // use current location

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <App />
      </AppContainer>
    </Provider>,
    document.getElementById('root')
  )
}

render()

if (module.hot) {
  module.hot.accept('./chrome/App', render)

  module.hot.accept('./reducers', () => {
    store.replaceReducer(rootReducer)
    render()
  })

  module.hot.accept('./router', () => {
    router.useRoutes(routes)
    store.dispatch(propagateCurrentLocation())
  })
}
