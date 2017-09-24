import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import { Provider as FelaProvider } from 'react-fela'
import { createRenderer } from 'fela'
import webPreset from 'fela-preset-web'

import { createStore, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { Provider } from 'react-redux'

import VProvider from 'client/utils/hoc'
import createApiClient from 'shared/api'
import App from './App'
import routes from './routes'
import rootReducer from './reducers'
import routerMiddleware from './router/middleware'

const store = createStore(
  rootReducer,
  applyMiddleware(
    reduxThunk.withExtraArgument(createApiClient('http://localhost:8080')),
    routerMiddleware,
  ),
)

const renderer = createRenderer({ plugins: webPreset })

function render() {
  ReactDOM.render(
    <Provider store={store}>
      <AppContainer>
        <FelaProvider renderer={renderer}>
          <VProvider baseUrl="http://localhost:8080" routes={routes}>
            <App />
          </VProvider>
        </FelaProvider>
      </AppContainer>
    </Provider>,
    document.getElementById('root')
  )
}

render()

if (module.hot) {
  module.hot.accept(['./App', './routes'], render)
  module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
}
