import React, { Component } from 'react'
import PropTypes from 'prop-types'

import debounce from 'lodash.debounce'
import { fuzzySearch } from 'shared/utils'
import { ViewContainer, Link, Input, Section, Text, Heading, Paper } from 'client/components'

export default class NotesView extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  }

  state = {
    filter: '',
  }

  componentWillMount() {
    this.props.store.listNotes()
  }

  getVisibleNotes() {
    const visibleNotes = this.props.store.notes.filter(({ name }) => fuzzySearch(this.state.filter, name.toLowerCase()))

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
        <Heading center>
          {notes.length} items
        </Heading>
        <div>{notes}</div>
      </ViewContainer>
    )
  }
}
