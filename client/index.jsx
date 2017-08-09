import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-fela'
import { createRenderer } from 'fela'
import webPreset from 'fela-preset-web'

import { AppContainer } from 'react-hot-loader'
import { Provider as StoreProvider } from 'client/utils/hoc'

import App from './App'

const renderer = createRenderer({
  plugins: [...webPreset],
})

function render() {
  ReactDOM.render(
    <AppContainer>
      <Provider renderer={renderer}>
        <StoreProvider baseUrl="http://localhost:8080">
          <App />
        </StoreProvider>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render()

if (module.hot) {
  module.hot.accept('./App', render)
}
