import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fuzzySearch, formatUnixTs } from 'shared/utils'
import s from 'client/styles'
import { Button, Toolbar, Link, LightInput, Select } from 'client/components'
import * as routerActions from 'client/router/actions'

const NoteItem = s.cx({
  cursor: 'pointer',
}, 'section', s.Paper)

const Time = s.cx({
  fontSize: 'var(--font-size-fine)',
  color: 'var(--color-secondary)',
  marginRight: 'var(--spacing-small)',
})

const sortOptions = {
  recent: 'Recently updated',
  alphabetical: 'Alphabetical',
}

const comparators = {
  recent: (n1, n2) => n2.updatedTs - n1.updatedTs,
  alphabetical: (n1, n2) => n1.name.toLowerCase() > n2.name.toLowerCase() ? 1 : -1,
}

class NotesView extends PureComponent {
  static propTypes = {
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
  }

  state = {
    sortBy: 'recent',
  }

  getVisibleNotes() {
    return this.props.notes
      .filter(({ name }) => fuzzySearch(this.props.filter, name.toLowerCase()))
      .sort(comparators[this.state.sortBy])
      .map(note => (
        <Link key={note.id} to={{ name: 'note', params: { id: note.id } }} className={NoteItem}>
          <time className={Time}>{formatUnixTs(note.updatedTs)}</time>
          {note.name}
        </Link>
      ))
  }

  updateTimoutId = null
  onFilterChange = (filter) => {
    if (filter.trim() === this.props.filter) return

    window.clearTimeout(this.updateTimoutId)
    this.updateTimoutId = window.setTimeout(this.props.setFilter, 300, filter)
  }

  componentWillUnmount() {
    window.clearTimeout(this.updateTimoutId)
  }

  render() {
    const notes = this.getVisibleNotes()

    const addBtn = (
      <Link to={{ name: 'add-note' }}>
        <Button>Add</Button>
      </Link>
    )

    const left = [
      (
        <LightInput
          key="filter"
          name="filter"
          defaultValue={this.props.filter}
          placeholder="Filter notes"
          onChange={this.onFilterChange}
          autoFocus
        />
      ),
      (
        <Select
          key="sortBy"
          name="sortBy"
          className="margin-horizontal-small"
          value={this.state.sortBy}
          onChange={sortBy => this.setState({ sortBy })}
          options={sortOptions}
        />
      ),
    ]

    return (
      <div className={s.ViewContainer}>
        <Toolbar left={left} right={addBtn} />
        <div className="text-center section">
          {notes.length} items
        </div>
        {notes}
      </div>
    )
  }
}

const mapStateToProps = ({ notes, router }) => ({
  notes: notes.notes,
  filter: router.query.filter || '',
})

const mapDispatchToProps = dispatch => ({
  setFilter(filter) {
    const params = filter.trim().length ? { filter } : null
    dispatch(routerActions.replace({ name: 'notes', params }))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(NotesView)
