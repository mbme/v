/* eslint-disable react/prop-types */

import React from 'react'

import { ConfirmationDialog, Icon } from 'client/components'
import NotesView from 'client/notes/Notes'
import NoteView from 'client/notes/Note'
import NoteEditorView from 'client/notes/NoteEditor'
import * as notesActions from 'client/notes/actions'

async function initNote(store, params) {
  const id = parseInt(params.id, 10)

  await store.dispatch(notesActions.listNotes())

  if (!store.getState().notes.notes.find(note => note.id === id)) {
    throw new Error(`Unknown note ${id}`)
  }
}

export default [
  {
    path: '',
    redirectTo: { name: 'notes' },
  },
  {
    path: '/one',
    name: 'one',
    render: () => (
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
        init: store => store.dispatch(notesActions.listNotes()),
        render: () => <NotesView />,
      },
      {
        name: 'add-note',
        path: '/add',
        render: () => <NoteEditorView />,
      },
      {
        name: 'note',
        path: '/:id',
        init: initNote,
        render: ({ id }) => <NoteView id={parseInt(id, 10)} />,
      },
      {
        name: 'note-editor',
        path: '/:id/editor',
        init: initNote,
        render: ({ id }) => <NoteEditorView id={parseInt(id, 10)} />,
      },
    ],
  },
  {
    path: '(.*)',
    render: () => null,
  },
]
