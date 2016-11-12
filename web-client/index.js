require('reflect-metadata')

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

// side effect: initialize the state
const { STATE } = require('web-client/AppState')

const RoutingStore = require('web-client/routingStore').default
const routingStore = STATE.get(RoutingStore)

// update state based on initial url
const { Router } = require('director')
Router({
  '/notes': () => routingStore.showNotes(),
}).configure({
  notfound: () => routingStore.showNotFound(window.location.pathname),
  html5history: true,
}).init()

// update url based on the routingStore changes
mobx.autorun(() => {
  const { page } = routingStore

  let path = ''

  switch (page.name) {
    case 'notes':
      path = '/notes'
      break

    case 'not-found':
      path = page.url
      break
  }

  if (path !== window.location.pathname) {
    window.history.pushState(null, null, path)
  }
})



// initial render
require('web-client/App').renderApp()

// hot reloading
if (__DEV__ && module.hot) {
  module.hot.accept('./App', function () {
    require('web-client/App').renderApp()
  })
}
