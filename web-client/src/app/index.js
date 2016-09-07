const { renderApp } = require('App')
const { initState } = require('AppState')

// init stores
const state = initState()

// initial render
renderApp(state)

// hot reloading
if (__DEV__ && module.hot) {
  module.hot.accept('./App', () => {
    const { renderApp } = require('App')
    renderApp(state)
  })
}
