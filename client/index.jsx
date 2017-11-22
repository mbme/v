import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import reduxThunk from 'redux-thunk'

import createApiClient from 'shared/api'
import network from './utils/network'
import routerMiddleware, { propagateCurrentLocation } from './router'
import rootReducer from './reducers'
import App from './chrome/App'
import { init as initStyles } from './styles'

initStyles()

const apiClient = createApiClient('', network)

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(apiClient),
    routerMiddleware,
  ),
)
store.dispatch(propagateCurrentLocation()) // use current location

ReactDOM.render(
  <Provider store={store}>
    <App apiClient={apiClient} />
  </Provider>,
  document.getElementById('root'),
)
