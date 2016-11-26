// STYLES
require('normalize.css')
require('web-client/styles.css')

require('mobx').useStrict(true) // do not allow to modify state out of actions

// prevent default drag-n-drop behavior in Chrome
// (it just opens the file in the current tab)
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => e.preventDefault())

const { Store } = require('web-client/store')
const store = new Store()

const renderApp = function() {
  const { createApp } = require('web-client/App')

  require('react-dom').render(createApp(store), document.getElementById('app'))
}

// initial render
renderApp()

// hot reloading
if (__DEV__ && module.hot) {
  module.hot.accept('./App', renderApp)
}
