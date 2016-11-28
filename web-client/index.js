// STYLES
require('normalize.css')
require('web-client/styles.css')

const mobx = require('mobx')
mobx.useStrict(true) // do not allow to modify state out of actions

// prevent default drag-n-drop behavior in Chrome
// (it just opens the file in the current tab)
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => e.preventDefault())

if (__DEV__) {
  document.title += ' -> DEV'
}

const Store = require('web-client/store').default
const store = new Store()

// init store injector
require('web-client/injector').setStore(store)


// update state based on initial url
const React = require('react')
const ReactDOM = require('react-dom')

const renderApp = function() {
  const App = require('web-client/App').default

  ReactDOM.render(
    React.createElement(App),
    document.getElementById('app')
  )
}

// initial render
renderApp()

// hot reloading
if (__DEV__ && module.hot) {
  module.hot.accept('./App', renderApp)
}
