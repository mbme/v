import * as React from 'react'
import * as ReactDOM from 'react-dom'

const appEl = document.getElementById('app')

if (appEl) {
  ReactDOM.render(
    <h1>HELLO</h1>,
    appEl
  )
} else {
  console.error("can't find root el #app")
}
