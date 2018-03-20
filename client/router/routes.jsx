/* eslint-disable react/prop-types */

import React from 'react';
import { ConfirmationDialog, Icon } from 'client/components';
import NotFoundView from 'client/chrome/NotFoundView';
import NotesView from 'client/notes/NotesView';
import NoteView from 'client/notes/NoteView';
import NoteEditorView from 'client/notes/NoteEditorView';
import TracksView from 'client/tracks/TracksView';

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

  // NOTES
  {
    path: '/notes',
    name: 'notes',
    render: () => <NotesView />,
  },
  {
    name: 'add-note',
    path: '/notes/add',
    render: () => <NoteEditorView />,
  },
  {
    name: 'note',
    path: '/notes/:id',
    render: ({ id }) => <NoteView id={parseInt(id, 10)} />,
  },
  {
    name: 'note-editor',
    path: '/notes/:id/editor',
    render: ({ id }) => <NoteEditorView id={parseInt(id, 10)} />,
  },

  // TRACKS
  {
    path: '/tracks',
    name: 'tracks',
    render: () => <TracksView />,
  },

  {
    path: '(.*)',
    render: () => <NotFoundView />,
  },
];
