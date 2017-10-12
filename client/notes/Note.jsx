import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { NotFoundView, LoadingView, ViewContainer, Link, Heading, Paper, Toolbar, IconButton } from 'client/components'
import * as notesActions from './actions'
import DeleteNoteButton from './DeleteNoteButton'

function renderMarkup(data) {
  return data.split('\n\n').map(
    (paragraph, i) => <p key={i}>{paragraph}</p> // eslint-disable-line react/no-array-index-key
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
    <ViewContainer>
      <Toolbar left={deleteBtn} right={editBtn} />
      <Paper>
        <Heading>{note.name}</Heading>
        {renderMarkup(note.data)}
      </Paper>
    </ViewContainer>
  )
}
NoteView.propTypes = {
  note: PropTypes.object.isRequired,
}

function Loader({ initialized, note, listNotes, ...props }) {
  if (!initialized) {
    listNotes()

    return <LoadingView />
  }

  if (!note) {
    return <NotFoundView />
  }

  return <NoteView note={note} {...props} />
}
Loader.propTypes = {
  initialized: PropTypes.bool.isRequired,
  note: PropTypes.object,
  listNotes: PropTypes.func.isRequired,
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.notes.find(note => note.id === id),
  initialized: notes.initialized,
})

const mapDispatchToProps = {
  listNotes: notesActions.listNotes,
}

export default connect(mapStateToProps, mapDispatchToProps)(Loader)
