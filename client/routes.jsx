/* eslint-disable react/prop-types */

import React from 'react'

import initNotesStore from './notes/store'
import NotesView from './notes/Notes'
import NoteView from './notes/Note'
import NoteEditorView from './notes/NoteEditor'

export default [
  {
    path: '/one',
    name: 'one',
    action: () => <h1>Page One</h1>,
  },
  {
    path: '/notes',
    store: {
      name: 'notes',
      init: initNotesStore,
    },
    children: [
      {
        name: 'notes',
        path: '/',
        action: context => <NotesView store$={context.stores.notes} />,
      },
      {
        name: 'note',
        path: '/:id',
        async action({ stores: { notes }, params }) {
          await notes.value.listNotesOnce()

          const id = parseInt(params.id, 10)
          if (Number.isNaN(id)) {
            return null
          }

          const note = notes.value.notes.find(rec => rec.id === id)

          if (!note) {
            return null
          }

          return <NoteView note={note} />
        },
      },
      {
        name: 'note-editor',
        path: '/:id/editor',
        async action({ stores: { notes }, params }) {
          await notes.value.listNotesOnce()

          const id = parseInt(params.id, 10)
          if (Number.isNaN(id)) {
            return null
          }

          const note = notes.value.notes.find(rec => rec.id === id)

          if (!note) {
            return null
          }

          return <NoteEditorView note={note} />
        },
      },
    ],
  },
  { path: '*', action: () => <h1>Not Found</h1> },
]
