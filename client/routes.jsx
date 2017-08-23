import React from 'react'
import NotesView from './notes/View'

export default [
  { path: '/one', name: 'one', action: () => <h1>Page One</h1> },
  { path: '/two', name: 'two', action: () => <h1>Page Two</h1> },
  { path: '/notes', name: 'notes', action: () => <NotesView /> },
  { path: '*', action: () => <h1>Not Found</h1> },
]
