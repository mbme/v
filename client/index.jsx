import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import { Provider as FelaProvider } from 'react-fela'
import { createRenderer } from 'fela'
import webPreset from 'fela-preset-web'

import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { Provider } from 'react-redux'

import Router from 'universal-router' // eslint-disable-line import/extensions
import createApiClient from 'shared/api'
import App from './App'
import { routes, propagateCurrentLocation } from './router'
import rootReducer from './reducers'
import routerMiddleware from './router/middleware'

const actualRoutes = [...routes]
const router = new Router(actualRoutes)

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(createApiClient('http://localhost:8080')),
    routerMiddleware(router),
  ),
)

// handle browser back/forward buttons, and history.back()/forward()/go()
window.addEventListener('popstate', () => store.dispatch(propagateCurrentLocation()))

store.dispatch(propagateCurrentLocation())

const renderer = createRenderer({ plugins: webPreset })

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <FelaProvider renderer={renderer}>
          <App router={router} />
        </FelaProvider>
      </AppContainer>
    </Provider>,
    document.getElementById('root')
  )
}

render()

if (module.hot) {
  module.hot.accept('./App', render)

  module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))

  module.hot.accept('./routes', () => {
    actualRoutes.splice(0, actualRoutes.length, ...routes)
    store.dispatch(propagateCurrentLocation())
  })
}
