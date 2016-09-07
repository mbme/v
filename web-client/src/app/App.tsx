import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {useStrict} from 'mobx'
import {Provider} from 'mobx-react'
import DevTools from 'mobx-react-devtools'

import { AppState } from 'AppState'

import NotesPage from 'notes/Page'
import ModalsContainer from 'modals/ModalsContainer'

// STYLES
import 'normalize.css'
import 'styles.css'

// do not allow to modify state out of actions
useStrict(true)

if (__DEV__) {
  document.title += ' -> DEV'
}

interface IProps {
  state: AppState,
}

export class App extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { state } = this.props

    const devTools = __DEV__ ? <DevTools /> : undefined
    return (
      <Provider modalsStore={state.modalsStore}>
        <div>
          <NotesPage store={state.notesStore} />
          <ModalsContainer />
          {devTools}
        </div>
      </Provider>
    )
  }
}

export function renderApp(state: AppState): void {
  ReactDOM.render(
    <App state={state} />,
    document.getElementById('app')
  )
}
