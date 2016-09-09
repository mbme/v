const { useStrict } = require('mobx')
const { renderApp } = require('App')
const { initState } = require('AppState')

// STYLES
require('normalize.css')
require('styles.css')

// do not allow to modify state out of actions
useStrict(true)

// prevent default drag-n-drop behavior in Chrome
// (it just opens the file in the current tab)
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());

if (__DEV__) {
  document.title += ' -> DEV'
}

// init stores
const state = initState()

// initial render
renderApp(state)

// hot reloading
if (__DEV__ && module.hot) {
  function updater() {
    const { renderApp } = require('App')
    renderApp(state)
  }

  module.hot.accept('./App', updater)
}
