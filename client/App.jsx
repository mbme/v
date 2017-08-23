import { Component } from 'react'
import PropTypes from 'prop-types'

export default class App extends Component {
  static contextTypes = {
    view$: PropTypes.object.isRequired,
  }

  state = {
    view: null,
  }

  unsubscribe = null

  componentWillMount() {
    this.unsubscribe = this.context.view$.subscribe(view => this.setState({ view }))
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return this.state.view
  }
}
