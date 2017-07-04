import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-fela'
import { createRenderer } from 'fela'
import webPreset from 'fela-preset-web'

import { AppContainer } from 'react-hot-loader'

import App from './App'

const renderer = createRenderer({
  plugins: [...webPreset],
})

renderer.renderStatic(require('material-components-web/dist/material-components-web.min.css'))

function render (Component) {
  ReactDOM.render(
    <AppContainer>
      <Provider renderer={renderer}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => render(App))
}
