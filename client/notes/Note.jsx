import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'client/utils'
import { ViewContainer, Heading, Paper, Toolbar, LinkButton } from 'client/components'

function renderMarkup(data) {
  return data.split('\n\n').map(
    (paragraph, i) => <p key={i}>{paragraph}</p> // eslint-disable-line react/no-array-index-key
  )
}

export default function NoteView({ note }) {
  return (
    <ViewContainer>
      <Toolbar>
        <Link key={note.id} to={{ name: 'note-editor', params: { id: note.id } }}>
          <LinkButton>Edit</LinkButton>
        </Link>
      </Toolbar>
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
