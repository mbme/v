import React from 'react'
import ReactDOM from 'react-dom'

import injectTapEventPlugin from 'react-tap-event-plugin'

import App from './views/App'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin()

// FIXME use react-hot-loader, fela
ReactDOM.render(
  React.createElement(App),
  document.getElementById('root')
)
