import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import { Provider as FelaProvider } from 'react-fela'
import { createRenderer } from 'fela'
import webPreset from 'fela-preset-web'

import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { Provider } from 'react-redux'

import createApiClient from 'shared/api'
import { routes as routesModule, routerMiddleware, propagateCurrentLocation } from './router'
import rootReducer from './reducers'
import App from './App'

const routes = [...routesModule]

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(createApiClient('http://localhost:8080')),
    routerMiddleware(routes),
  ),
)
store.dispatch(propagateCurrentLocation()) // use current location

const renderer = createRenderer({ plugins: webPreset })

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
  module.hot.accept('./App', render)

  module.hot.accept('./reducers', () => {
    store.replaceReducer(rootReducer)
    render()
  })

  module.hot.accept('./router', () => {
    routes.splice(0, routes.length, ...routesModule) // replace routes using update module data
    store.dispatch(propagateCurrentLocation())
  })
}
