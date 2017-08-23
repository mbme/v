import React, { Component } from 'react'
import PropTypes from 'prop-types'

import debounce from 'lodash.debounce'
import { connect, styled, mixins, Link } from 'client/utils'
import { fuzzySearch } from 'shared/utils'
import { Input, Section, Text, Heading } from 'client/components'

const Container = styled('Container', {
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  width: '40%',
})

const Record = styled('Record', {
  backgroundColor: '#fff',

  ...mixins.border,
  borderRadius: '2px',

  extend: [
    ...mixins.margins('vertical', 'medium'),
    ...mixins.paddings('all', 'medium'),
  ],
})

class NotesView extends Component {
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
      <Link key={id} to={{ name: 'one' }}>
        <Record>{name}</Record>
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
      <Container>
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
      </Container>
    )
  }
}

function initStore(client) {
  return {
    notes: [],

    async listNotes() {
      this.notes = await client.listRecords('note')
    },
  }
}

export default connect(initStore)(NotesView)
