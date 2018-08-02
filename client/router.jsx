/* eslint-disable react/prop-types */

import React from 'react';
import { pubSub } from '../shared/utils';
import createRouter from './utils/createRouter';
import NotFoundView from './chrome/NotFoundView';
import ThemeView from './chrome/ThemeView';
import NotesView from './notes/NotesView';
import NoteView from './notes/NoteView';
import NoteEditorView from './notes/NoteEditorView';

const router = createRouter([
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

  {
    name: 'not-found',
    path: '(.*)',
    render: () => <NotFoundView />,
  },
]);

export default router;

export const historyEvents = pubSub();

export function propagateCurrentLocation(isPush = false) {
  historyEvents.emit('locationChange', {
    pathname: window.location.pathname,
    search: window.location.search,
    isPush,
  });
}

export function push({ name, params, query }) {
  window.history.pushState(null, '', router.getUrl(name, params, query));
  propagateCurrentLocation(true);
}

export function replace({ name, params, query }) {
  window.history.replaceState(null, '', router.getUrl(name, params, query));
  propagateCurrentLocation(true);
}

export function replaceQueryParam(param, value) {
  const { route, params, query } = router.getState();

  replace({
    name: route.name,
    params,
    query: {
      ...query,
      [param]: value,
    },
  });
}
