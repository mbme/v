import * as React from 'react'
import * as ReactDOM from 'react-dom'

import {Provider} from 'mobx-react'
import DevTools from 'mobx-react-devtools'

import { AppState } from 'AppState'

import NotesPage from 'notes/Page'
import ModalsContainer from 'modals/ModalsContainer'
import ToastsContainer from 'modals/ToastsContainer'

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
          <ToastsContainer />
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
