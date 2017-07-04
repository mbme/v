import React from 'react'
import PropTypes from 'prop-types'
import Icon from './Icon'
import Button from './Button'
import connect from './store'

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  }

  componentWillMount () {
    // this.props.store.start()
  }

  render () {
    return (
      <h1 className="mdc-typography--display1">
        HELLO WORLD <Icon name="face" size="large" />
        {this.props.store.time}
        {this.props.store.items}
        <Button className="mdc-button--raised">TEST</Button>
      </h1>
    )
  }
}

function initStore () {
  return {
    time: 0,
    items: [],

    start () {
      setInterval(() => {
        // this.time += 1
        this.items.push('x')
        this.time = this.items.length
      }, 1000)
    },
  }
}

export default connect(initStore)(App)
