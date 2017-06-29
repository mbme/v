import React from 'react'
import ReactDOM from 'react-dom'

import { createRenderer } from 'fela'
import { render as felaRender } from 'fela-dom'
import unit from 'fela-plugin-unit'

import { AppContainer } from 'react-hot-loader'

import App from './App'

const robotoStyles = require('raw-loader!./roboto-fontface.css')

const renderer = createRenderer({
  plugins: [unit()],
})

// html {
//   font-family: 'Roboto', sans-serif;
//   box-sizing: border-box;
// }

// *, *:before, *:after {
//   box-sizing: inherit;
// }

// body {
//   font-size: 14px;
//   line-height: 1.3;
//   margin: 0;
// }

renderer.renderStatic(`
${robotoStyles}
html {
  font-family: 'Roboto', sans-serif;
  box-sizing: border-box;
}
`)

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
