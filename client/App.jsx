import React from 'react'
import PropTypes from 'prop-types'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import ActionHome from 'material-ui/svg-icons/action/home'
import connect from 'client/store'

class App extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  }

  componentWillMount () {
    // this.props.store.start()
  }

  render () {
    return (
      <Paper>
        <h1>HELLO WORLD</h1>
        {this.props.store.time}
        {this.props.store.items}
        <ActionHome />
        <RaisedButton primary>
          TEST
        </RaisedButton>
      </Paper>
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
