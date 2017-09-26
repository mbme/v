import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import debounce from 'lodash.debounce'
import { fuzzySearch } from 'shared/utils'
import { ViewContainer, Link, Input, Section, Text, Paper } from 'client/components'
import * as notesActions from './actions'

class NotesView extends Component {
  static propTypes = {
    listNotes: PropTypes.func.isRequired,
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  state = {
    filter: '',
  }

  componentWillMount() {
    this.props.listNotes()
  }

  getVisibleNotes() {
    const visibleNotes = this.props.notes.filter(({ name }) => fuzzySearch(this.state.filter, name.toLowerCase()))

    return visibleNotes.map(({ id, name }) => (
      <Link key={id} to={{ name: 'note', params: { id } }}>
        <Paper>{name}</Paper>
      </Link>
    ))
  }

  setFilter = (filter) => {
    if (this.state.filter !== filter) {
      this.setState({ filter })
    }
  }
  setFilterDebounced = debounce(this.setFilter, 300)

  onFilterChange = e => this.setFilterDebounced(e.target.value.trim())

  render() {
    const notes = this.getVisibleNotes()

    return (
      <ViewContainer>
        <Section>
          <Input name="filter" type="text" placeholder="Filter notes" onChange={this.onFilterChange} />
        </Section>
        <Text center>
          {notes.length} items
        </Text>
        <div>{notes}</div>
      </ViewContainer>
    )
  }
}

const mapStateToProps = ({ notes }) => ({
  notes: notes.notes,
})

const mapDispatchToProps = {
  listNotes: notesActions.listNotes,
}

export default connect(mapStateToProps, mapDispatchToProps)(NotesView)
