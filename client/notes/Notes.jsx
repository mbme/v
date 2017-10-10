import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import debounce from 'lodash.debounce'
import { fuzzySearch } from 'shared/utils'
import { ViewContainer, Toolbar, FlatButton, Link, Input, Section, Text, Paper } from 'client/components'
import * as routerActions from 'client/router/actions'
import * as notesActions from './actions'

class NotesView extends Component {
  static propTypes = {
    listNotes: PropTypes.func.isRequired,
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
    createNote: PropTypes.func.isRequired,
  }

  componentWillMount() {
    this.props.listNotes()
  }

  getVisibleNotes() {
    const visibleNotes = this.props.notes.filter(({ name }) => fuzzySearch(this.props.filter, name.toLowerCase()))

    return visibleNotes.map(({ id, name }) => (
      <Link key={id} to={{ name: 'note', params: { id } }}>
        <Section side="vertical">
          <Paper>{name}</Paper>
        </Section>
      </Link>
    ))
  }

  setFilterDebounced = debounce(this.props.setFilter, 300)
  onFilterChange = e => this.setFilterDebounced(e.target.value.trim())

  render() {
    const notes = this.getVisibleNotes()

    const addBtn = (
      <FlatButton onClick={this.props.createNote}>Add</FlatButton>
    )

    return (
      <ViewContainer>
        <Toolbar right={addBtn} />
        <Section side="bottom">
          <Input
            name="filter"
            type="text"
            defaultValue={this.props.filter}
            placeholder="Filter notes"
            onChange={this.onFilterChange}
            autoFocus
          />
        </Section>
        <Text center>
          {notes.length} items
        </Text>
        <div>{notes}</div>
      </ViewContainer>
    )
  }
}

const mapStateToProps = ({ notes, router }) => ({
  notes: notes.notes,
  filter: router.query.filter || '',
})

const mapDispatchToProps = dispatch => ({
  listNotes: () => dispatch(notesActions.listNotes()),
  async createNote() {
    const id = await dispatch(notesActions.createNote('Tabula rasa', ''))
    return dispatch(routerActions.push('note-editor', { id }))
  },
  setFilter: filter => dispatch(routerActions.replace('notes', filter ? { filter } : null)),
})

export default connect(mapStateToProps, mapDispatchToProps)(NotesView)
