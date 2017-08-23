import React from 'react'
import ReactDOM from 'react-dom'

import { Provider as FelaProvider } from 'react-fela'
import { createRenderer } from 'fela'
import webPreset from 'fela-preset-web'

import { AppContainer } from 'react-hot-loader'
import { VProvider } from 'client/utils/hoc'

import App from './App'
import routes from './routes'

const renderer = createRenderer({
  plugins: [...webPreset],
})

function render() {
  ReactDOM.render(
    <AppContainer>
      <FelaProvider renderer={renderer}>
        <VProvider baseUrl="http://localhost:8080" routes={routes}>
          <App />
        </VProvider>
      </FelaProvider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render()

if (module.hot) {
  module.hot.accept(['./App', './routes'], render)
}
