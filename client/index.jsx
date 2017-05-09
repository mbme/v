import React from 'react'
import ReactDOM from 'react-dom'

import { createRenderer } from 'fela'
import { Provider } from 'react-fela'
import unit from 'fela-plugin-unit'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import { AppContainer } from 'react-hot-loader'

import App from './App'

import injectTapEventPlugin from 'react-tap-event-plugin'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const renderer = createRenderer({
  plugins: [ unit() ],
})

renderer.renderStatic(`
  html {
    font-family: 'Roboto', sans-serif;
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    font-size: 14px;
    line-height: 1.15;
    margin: 0;
  }
`)

function render (Component) {
  ReactDOM.render(
    <Provider renderer={renderer} mountNode={document.getElementById('stylesheet')}>
      <MuiThemeProvider>
        <AppContainer>
          <Component />
        </AppContainer>
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./views/App', () => render(App))
}
