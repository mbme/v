import React, { Component } from 'react'
import PropTypes from 'prop-types'

import debounce from 'lodash.debounce'
import { connect, styled, mixins, fuzzySearch } from 'client/utils'
import { Input, Section, Text } from 'client/components'

const Container = styled({
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  width: '40%',
})

const Record = styled({
  backgroundColor: '#fff',
  ...mixins.border,
  borderRadius: '2px',
  padding: '2rem',
  margin: '1rem 0',
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
      <Record key={id}>{name}</Record>
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
