import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link, Toolbar, IconButton } from 'client/components'
import DeleteNoteButton from './DeleteNoteButton'
import Note from './Note'

class NoteView extends PureComponent {
  static propTypes = {
    note: PropTypes.object.isRequired,
  }

  render() {
    const { note } = this.props

    const deleteBtn = (
      <DeleteNoteButton key="delete" id={note.id} />
    )

    const editBtn = (
      <Link to={{ name: 'note-editor', params: { id: note.id } }}>
        <IconButton type="edit-2" />
      </Link>
    )

    return (
      <div className="view-container">
        <Toolbar left={deleteBtn} right={editBtn} />
        <Note name={note.name} data={note.data} />
      </div>
    )
  }
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.notes.find(note => note.id === id),
})

export default connect(mapStateToProps)(NoteView)
