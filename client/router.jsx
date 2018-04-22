/* eslint-disable react/prop-types */

import React from 'react';
import createRouter from 'client/utils/createRouter';
import NotFoundView from 'client/chrome/NotFoundView';
import ThemeView from 'client/chrome/ThemeView';
import NotesView from 'client/notes/NotesView';
import NoteView from 'client/notes/NoteView';
import NoteEditorView from 'client/notes/NoteEditorView';
import TracksView from 'client/tracks/TracksView';

export default createRouter([
  {
    name: 'index',
    path: '',
    redirectTo: { name: 'notes' },
  },
  {
    path: '/theme',
    name: 'theme',
    render: () => <ThemeView />,
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
    name: 'not-found',
    path: '(.*)',
    render: () => <NotFoundView />,
  },
]);
