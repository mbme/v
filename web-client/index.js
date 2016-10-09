require('reflect-metadata')

// STYLES
require('normalize.css')
require('styles.css')

// do not allow to modify state out of actions
require('mobx').useStrict(true)

// prevent default drag-n-drop behavior in Chrome
// (it just opens the file in the current tab)
function preventDefault(e) {
  e.preventDefault()
}
document.addEventListener('dragover', preventDefault)
document.addEventListener('drop', preventDefault)

// init state
require('AppState')

if (__DEV__) {
  document.title += ' -> DEV'
}

// initial render
require('App').renderApp()

// hot reloading
if (__DEV__ && module.hot) {
  module.hot.accept('./App', function () {
    require('App').renderApp()
  })
}
