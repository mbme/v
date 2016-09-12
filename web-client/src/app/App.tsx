import * as React from 'react'
import * as ReactDOM from 'react-dom'

import DevTools from 'mobx-react-devtools'

import NotesPage from 'notes/Page'
import ModalsContainer from 'modals/ModalsContainer'
import ToastsContainer from 'modals/ToastsContainer'

export class App extends React.Component<{}, {}> {
  render (): JSX.Element {
    const devTools = __DEV__ ? <DevTools /> : undefined
    return (
      <div className="App">
        <NotesPage />
        <ModalsContainer />
        <ToastsContainer />
        {devTools}
      </div>
    )
  }
}

export function renderApp(): void {
  ReactDOM.render(
    <App />,
    document.getElementById('app')
  )
}
