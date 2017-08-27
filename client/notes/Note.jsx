import React from 'react'
import PropTypes from 'prop-types'
import { styled } from 'client/utils'

const Container = styled('Container', {
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  width: '40%',
})

export default function NoteView({ note }) {
  return (
    <Container>
      <h1>{note.name}</h1>
      {note.data.split('\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    </Container>
  )
}

NoteView.propTypes = {
  note: PropTypes.object.isRequired,
}
