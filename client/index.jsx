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
import { showToast } from './chrome/actions'
import { init as initStyles } from './styles'

initStyles()

let onPOSTError
const apiClient = createApiClient('', {
  ...network,
  POST: (...args) => network.POST(...args).catch((e) => {
    onPOSTError(e)
    throw e
  }),
})

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(apiClient),
    routerMiddleware,
  ),
)
store.dispatch(propagateCurrentLocation()) // use current location
onPOSTError = e => store.dispatch(showToast(e.toString()))

ReactDOM.render(
  <Provider store={store}>
    <App apiClient={apiClient} />
  </Provider>,
  document.getElementById('root'),
)
