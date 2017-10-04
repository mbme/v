/* eslint-disable react/prop-types */

import React from 'react'

import { ConfirmationDialog, Icon, NotFoundView } from 'client/components'
import NotesView from 'client/notes/Notes'
import NoteView from 'client/notes/Note'
import NoteEditorView from 'client/notes/NoteEditor'

export default [
  {
    path: '/one',
    name: 'one',
    action: () => (
      <div>
        <h1>Page One</h1>
        <ConfirmationDialog confirmation="Remove" onConfirmed={() => {}} onCancel={() => {}}>
          Are you sure you want to <b>remove it?</b>
          <Icon type="edit" />
        </ConfirmationDialog>
      </div>
    ),
  },
  {
    path: '/notes',
    name: 'notes',
    children: [
      {
        action: () => <NotesView />,
      },
      {
        name: 'note',
        path: '/:id',
        action: ({ params }) => <NoteView id={parseInt(params.id, 10)} />,
      },
      {
        name: 'note-editor',
        path: '/:id/editor',
        action: ({ params }) => <NoteEditorView id={parseInt(params.id, 10)} />,
      },
    ],
  },
  { path: '(.*)', action: () => <NotFoundView /> },
]
