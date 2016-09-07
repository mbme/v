import * as React from 'react'
import * as ReactDOM from 'react-dom'

// STYLES
import 'normalize.css'
import 'styles.css'

import {useStrict} from 'mobx'

import App, { AppType } from 'App'
import AppState from 'AppState'

// do not allow to modify state out of actions
useStrict(true)

if (__DEV__) {
  document.title += ' -> DEV'
}

// init stores
const state = new AppState()
state.init()

function renderApp(App: AppType): void {
  const el = React.createElement(App, { state })
  ReactDOM.render(
    el,
    document.getElementById('app')
  )
}

// initial render
renderApp(App)

// hot reloading
if (__DEV__ && module.hot) {
  module.hot.accept('./App', () => {
    const nextApp = require<AppType>('./App').default // tslint:disable-line no-require-imports
    renderApp(nextApp)
  })
}
