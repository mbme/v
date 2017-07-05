import React from 'react'
import PropTypes from 'prop-types'

import Paper from 'material-ui/Paper'
import AppBar from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import NavigationMenu from 'material-ui/svg-icons/navigation/menu'
import Drawer from 'material-ui/Drawer'
import TextField from 'material-ui/TextField'
import { List, ListItem } from 'material-ui/List'

import { connect } from 'client/utils'

class NotesView extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  }

  state = {
    showList: true,
  }

  componentWillMount () {
    this.props.store.listNotes()
  }

  toggleList = () => this.setState({ showList: !this.state.showList })

  render () {
    const { notes } = this.props.store

    const appBarIcon = this.state.showList ? <NavigationClose /> : <NavigationMenu />

    return (
      <div>
        <AppBar
          title="Notes"
          iconElementLeft={<IconButton>{appBarIcon}</IconButton>}
          onLeftIconButtonTouchTap={this.toggleList}
          />

        <Drawer open={this.state.showList} openSecondary>
          <TextField hintText="Search" />
          <List>
            {notes.map(note => <ListItem key={note.id} primaryText={note.name} />)}
          </List>
        </Drawer>

        <Paper>
          <pre>
            {JSON.stringify(notes, null, 2)}
          </pre>
        </Paper>
      </div>
    )
  }
}

function initStore (client) {
  return {
    notes: [],

    async listNotes () {
      this.notes = await client.listRecords('note')
    },
  }
}

export default connect(initStore)(NotesView)
