import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import debounce from 'lodash.debounce'
import { fuzzySearch } from 'shared/utils'
import { ViewContainer, Toolbar, FlatButton, Link, Input, Section, Text, Paper } from 'client/components'
import * as routerActions from 'client/router/actions'

class NotesView extends Component {
  static propTypes = {
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
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
      <Link to={{ name: 'add-note' }}>
        <FlatButton>Add</FlatButton>
      </Link>
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
        {notes}
      </ViewContainer>
    )
  }
}

const mapStateToProps = ({ notes, router }) => ({
  notes: notes.notes,
  filter: router.query.filter || '',
})

const mapDispatchToProps = dispatch => ({
  setFilter: filter => dispatch(routerActions.replace({ name: 'notes', params: filter ? { filter } : null })),
})

export default connect(mapStateToProps, mapDispatchToProps)(NotesView)
