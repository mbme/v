import React, { Component } from 'react'
import Router from 'universal-router'

import NotesView from './notes/View'


const routes = [
  { path: '/one', action: () => <h1>Page One</h1> },
  { path: '/two', action: () => <h1>Page Two</h1> },
  { path: '/notes', action: () => <NotesView /> },
  { path: '*', action: () => <h1>Not Found</h1> },
]

export default class App extends Component {
  router = null
  path = null

  constructor(props) {
    super(props)

    this.router = new Router(routes)

    this.state = {
      view: null,
    }
  }

  componentWillMount() {
    this.updateLocation(location.pathname)
  }

  updateLocation = (path) => {
    if (path === this.path) {
      console.error('SAME PATH', path)
      return
    }

    this.path = path
    this.router.resolve(path).then(view => this.setState({ view }))
  }

  render() {
    return this.state.view
  }
}
