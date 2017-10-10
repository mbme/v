import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import { Provider as FelaProvider } from 'react-fela'
import { createRenderer } from 'fela'
import combineArrays from 'fela-combine-arrays'
import webPreset from 'fela-preset-web'

import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { Provider } from 'react-redux'

import createApiClient from 'shared/api'
import createRouter, { routerMiddleware, propagateCurrentLocation } from './router'
import routes from './router/routes'
import rootReducer from './reducers'
import App from './chrome/App'

const router = createRouter()
router.useRoutes(routes)

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(createApiClient('http://localhost:8080')),
    routerMiddleware(router),
  ),
)
store.dispatch(propagateCurrentLocation()) // use current location

const renderer = createRenderer({ plugins: webPreset, enhancers: [combineArrays()] })

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <FelaProvider renderer={renderer}>
          <App />
        </FelaProvider>
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

  module.hot.accept('./router/routes', () => {
    router.useRoutes(routes)
    store.dispatch(propagateCurrentLocation())
  })
}
