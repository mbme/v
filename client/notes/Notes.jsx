import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import debounce from 'lodash.debounce'
import { fuzzySearch } from 'shared/utils'
import styles from 'client/styles'
import { Toolbar, Link, Input } from 'client/components'
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
      <Link key={id} to={{ name: 'note', params: { id } }} className="Section">
        <div className={styles.Paper}>{name}</div>
      </Link>
    ))
  }

  onFilterChange = debounce(this.props.setFilter, 300)

  render() {
    const notes = this.getVisibleNotes()

    const addBtn = (
      <Link to={{ name: 'add-note' }}>
        <button className={styles.FlatButton}>Add</button>
      </Link>
    )

    return (
      <div className="ViewContainer">
        <Toolbar right={addBtn} />
        <div className="Section">
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
  setFilter(rawFilter) {
    const filter = rawFilter.trim()
    const params = filter ? { filter } : null
    dispatch(routerActions.replace({ name: 'notes', params }))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(NotesView)
