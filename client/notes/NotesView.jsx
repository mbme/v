import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { fuzzySearch } from 'shared/utils'
import s from 'client/styles'
import { Button, Toolbar, Link, Input } from 'client/components'
import * as routerActions from 'client/router/actions'

const NoteItem = s.cx({
  cursor: 'pointer',
}, 'section', s.Paper)

class NotesView extends Component {
  static propTypes = {
    notes: PropTypes.arrayOf(PropTypes.object).isRequired,
    filter: PropTypes.string.isRequired,
    setFilter: PropTypes.func.isRequired,
  }

  getVisibleNotes() {
    const visibleNotes = this.props.notes.filter(({ name }) => fuzzySearch(this.props.filter, name.toLowerCase()))

    return visibleNotes.map(({ id, name }) => (
      <Link
        key={id}
        to={{ name: 'note', params: { id } }}
        className={NoteItem}
      >
        {name}
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

    return (
      <div className={s.ViewContainer}>
        <Toolbar right={addBtn} />
        <div className="section">
          <Input
            name="filter"
            defaultValue={this.props.filter}
            placeholder="Filter notes"
            onChange={this.onFilterChange}
            autoFocus
          />
        </div>
        <div className="text-center">
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
