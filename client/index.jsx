import React from 'react'
import ReactDOM from 'react-dom'

import { createRenderer } from 'fela'
import { render as felaRender } from 'fela-dom'
import webPreset from 'fela-preset-web'

import { AppContainer } from 'react-hot-loader'

import App from './App'

const renderer = createRenderer({
  plugins: [...webPreset],
})
window.renderer = renderer

felaRender(renderer, document.getElementById('stylesheet'))

function render (Component) {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => render(App))
}
