require('reflect-metadata')

const { useStrict } = require('mobx')
const { renderApp } = require('App')

// STYLES
require('normalize.css')
require('styles.css')

// do not allow to modify state out of actions
useStrict(true)

// prevent default drag-n-drop behavior in Chrome
// (it just opens the file in the current tab)
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());

// init state
require('AppState')

if (__DEV__) {
  document.title += ' -> DEV'
}

// initial render
renderApp()

// hot reloading
if (__DEV__ && module.hot) {
  module.hot.accept(
    './App', () => require('App').renderApp()
  )
}
