import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import styles from 'client/styles'
import { Link, Toolbar, IconButton } from 'client/components'
import DeleteNoteButton from './DeleteNoteButton'

function renderMarkup(data) {
  return data.split('\n\n').map(
    (paragraph, i) => <p key={i} style={{ textIndent: '1rem' }}>{paragraph}</p> // eslint-disable-line react/no-array-index-key
  )
}

function NoteView({ note }) {
  const deleteBtn = (
    <DeleteNoteButton key="delete" id={note.id} />
  )

  const editBtn = (
    <Link to={{ name: 'note-editor', params: { id: note.id } }}>
      <IconButton type="edit-2" />
    </Link>
  )

  return (
    <div className="ViewContainer">
      <Toolbar left={deleteBtn} right={editBtn} />
      <div className={styles.Paper}>
        <div className={styles.Heading}>{note.name}</div>
        {renderMarkup(note.data)}
      </div>
    </div>
  )
}
NoteView.propTypes = {
  note: PropTypes.object.isRequired,
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.notes.find(note => note.id === id),
})

export default connect(mapStateToProps)(NoteView)
