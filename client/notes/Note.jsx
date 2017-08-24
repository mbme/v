import React from 'react'
import PropTypes from 'prop-types'

export default function NoteView({ note }) {
  return (
    <div>
      <h1>{note.name}</h1>
      <p>{note.data}</p>
    </div>
  )
}

NoteView.propTypes = {
  note: PropTypes.object.isRequired,
}
