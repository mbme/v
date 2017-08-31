import React from 'react'
import PropTypes from 'prop-types'
import { ViewContainer, Paper, Toolbar, LinkButton } from 'client/components'

export default function NoteEditorView({ note }) {
  return (
    <ViewContainer>
      <Toolbar>
        <LinkButton>SAVE</LinkButton>
        <LinkButton>DELETE</LinkButton>
        <LinkButton>CANCEL</LinkButton>
      </Toolbar>
      <Paper>
        <input name="name" type="text" value={note.name} />
      </Paper>
      <Paper>
        <textarea cols="30" id="" name="" rows="10">{note.data}</textarea>
      </Paper>
    </ViewContainer>
  )
}

NoteEditorView.propTypes = {
  note: PropTypes.object.isRequired,
}
