import React from 'react'
import PropTypes from 'prop-types'
import { styled, mixins } from 'client/utils'
import { ViewContainer, Heading } from 'client/components'

const Page = styled('Page', {
  backgroundColor: '#fff',

  ...mixins.border,
  borderRadius: '2px',

  extend: [
    ...mixins.margins('vertical', 'medium'),
    ...mixins.paddings('all', 'medium'),
  ],
})

export default function NoteView({ note }) {
  return (
    <ViewContainer>
      <Page>
        <Heading>{note.name}</Heading>
        {note.data.split('\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      </Page>
    </ViewContainer>
  )
}

NoteView.propTypes = {
  note: PropTypes.object.isRequired,
}
