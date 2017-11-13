import React from 'react'
import ReactDOM from 'react-dom'

import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import reduxThunk from 'redux-thunk'

import createApiClient from 'shared/api'
import browserApiClient from './utils/apiClient'
import routerMiddleware, { propagateCurrentLocation } from './router'
import rootReducer from './reducers'
import App from './chrome/App'
import { init as initStyles } from './styles'

initStyles()

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(createApiClient('', browserApiClient)),
    routerMiddleware,
  ),
)
store.dispatch(propagateCurrentLocation()) // use current location

ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'))
