import * as React from 'react'
import * as ReactDOM from 'react-dom'

// STYLES
import 'normalize.css'
import 'main.css'

import {useStrict} from 'mobx'
import {Provider} from 'mobx-react'
import DevTools from 'mobx-react-devtools'

import NotesStore from 'notes/store'
import NotesPage from 'notes/Page'

import ModalsStore from 'modals/store'
import ModalsContainer from 'modals/ModalsContainer'

// webpack variable: true if dev mode enabled
declare const __DEV__: boolean

// do not allow to modify state out of actions
useStrict(true)

if (__DEV__) {
  document.title += ' -> DEV'
}

const notesStore = new NotesStore()
notesStore.loadRecordsList()

const modalsStore = new ModalsStore()

const devTools = __DEV__ ? <DevTools /> : undefined
ReactDOM.render(
  <Provider modalsStore={modalsStore}>
    <div>
      <NotesPage store={notesStore} />
      <ModalsContainer store={modalsStore} />
      {devTools}
    </div>
  </Provider>,
  document.getElementById('app')
)
