import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fuzzySearch, formatUnixTs } from 'shared/utils'
import s from 'client/styles'
import { Button, Toolbar, Link, LightInput } from 'client/components'
import * as routerActions from 'client/router/actions'

const Counter = s.cx({
  marginLeft: 'var(--spacing-small)',
  whiteSpace: 'nowrap',
})

const Time = s.cx({
  marginRight: 'var(--spacing-small)',
})

const recent = (n1, n2) => n2.updatedTs - n1.updatedTs

class NotesView extends PureComponent {
  static propTypes = {
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
  }

  getVisibleNotes() {
    return this.props.notes
      .filter(({ name }) => fuzzySearch(this.props.filter, name.toLowerCase()))
      .sort(recent)
      .map(note => (
        <Link key={note.id} to={{ name: 'note', params: { id: note.id } }} className="section">
          <small className={Time}>{formatUnixTs(note.updatedTs)}</small>
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
        <small key="counter" className={Counter}>
          {notes.length} items
        </small>
      ),
    ]

    return (
      <div className="view-container">
        <Toolbar left={left} right={addBtn} />
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
