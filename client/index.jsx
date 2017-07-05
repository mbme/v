import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-fela'
import { createRenderer } from 'fela'
import webPreset from 'fela-preset-web'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { AppContainer } from 'react-hot-loader'
import injectTapEventPlugin from 'react-tap-event-plugin'

import App from './App'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const renderer = createRenderer({
  plugins: [...webPreset],
})

function render (Component) {
  ReactDOM.render(
    <AppContainer>
      <Provider renderer={renderer}>
        <MuiThemeProvider>
          <Component />
        </MuiThemeProvider>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => render(App))
}
