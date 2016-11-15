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

const RoutingStore = require('web-client/routingStore').default
const NotesStore = require('web-client/notes/store').default
const ModalsStore = require('web-client/modals/store').default

// init state
const STATE = new Map()
STATE.set(NotesStore, new NotesStore())
STATE.set(ModalsStore, new ModalsStore())
const routingStore = new RoutingStore()
STATE.set(RoutingStore, routingStore)

// init store injector
require('web-client/injector').setState(STATE)


// update state based on initial url
const { Router } = require('director')
Router({
  '/': () => routingStore.showMainPage(),
  '/notes': () => routingStore.showNotes(),
}).configure({
  notfound: () => routingStore.showNotFound(window.location.pathname),
  html5history: true,
}).init()

// update url based on the routingStore changes
mobx.autorun(() => {
  const { url } = routingStore.page

  if (url !== window.location.pathname) {
    window.history.pushState(null, null, url)
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
