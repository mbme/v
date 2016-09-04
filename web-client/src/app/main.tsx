import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {useStrict} from 'mobx'
import DevTools from 'mobx-react-devtools'

import NotesStore from 'notes/store'
import NotesPage from 'notes/Page'

// webpack variable: true if dev mode enabled
declare const __DEV__: boolean

// do not allow to modify state out of actions
useStrict(true)

if (__DEV__) {
  document.title += ' -> DEV'
}

const notesStore = new NotesStore()
notesStore.loadRecordsList()

const devTools = __DEV__ ? <DevTools /> : undefined
ReactDOM.render(
  <div>
    <NotesPage store={notesStore} />
    {devTools}
  </div>,
  document.getElementById('app')
)
