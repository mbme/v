import React from 'react'
import ReactDOM from 'react-dom'

import { createRenderer } from 'fela'
import { Provider } from 'react-fela'
import unit from 'fela-plugin-unit'

import { AppContainer } from 'react-hot-loader'

import App from './views/App'

import injectTapEventPlugin from 'react-tap-event-plugin'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

const renderer = createRenderer({
  plugins: [ unit() ],
})

function render (Component) {
  ReactDOM.render(
    <Provider renderer={renderer} mountNode={document.getElementById('stylesheet')}>
      <AppContainer>
        <Component />
      </AppContainer>
    </Provider>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./views/App', () => render(App))
}
