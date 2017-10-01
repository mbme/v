import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import debounce from 'lodash.debounce'
import { fuzzySearch } from 'shared/utils'
import { ViewContainer, Link, Input, Section, Text, Paper } from 'client/components'
import * as routerActions from 'client/router/actions'
import * as notesActions from './actions'

class NotesView extends Component {
  static propTypes = {
    listNotes: PropTypes.func.isRequired,
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    replace: PropTypes.func.isRequired,
  }

  componentWillMount() {
    this.props.listNotes()
  }

  getVisibleNotes() {
    const visibleNotes = this.props.notes.filter(({ name }) => fuzzySearch(this.props.filter, name.toLowerCase()))

    return visibleNotes.map(({ id, name }) => (
      <Link key={id} to={{ name: 'note', params: { id } }}>
        <Paper>{name}</Paper>
      </Link>
    ))
  }

  setFilter = filter => this.props.replace('notes', filter ? { filter } : null)
  setFilterDebounced = debounce(this.setFilter, 300)
  onFilterChange = e => this.setFilterDebounced(e.target.value.trim())

  render() {
    const notes = this.getVisibleNotes()

    return (
      <ViewContainer>
        <Section>
          <Input name="filter" type="text" defaultValue={this.props.filter} placeholder="Filter notes" onChange={this.onFilterChange} />
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

const mapDispatchToProps = {
  listNotes: notesActions.listNotes,
  replace: routerActions.replace,
}

export default connect(mapStateToProps, mapDispatchToProps)(NotesView)
