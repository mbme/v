// STYLES
require('normalize.css')
require('simple-client/styles.css')

require('mobx').useStrict(true) // do not allow to modify state out of actions

// prevent default drag-n-drop behavior in Chrome
// (it just opens the file in the current tab)
document.addEventListener('dragover', e => e.preventDefault())
document.addEventListener('drop', e => e.preventDefault())


const React = require('react')
const ReactDOM = require('react-dom')

ReactDOM.render(require('./setup').render(), document.getElementById('app'))
