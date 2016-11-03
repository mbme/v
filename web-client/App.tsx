import * as React from 'react'
import * as ReactDOM from 'react-dom'

import DevTools from 'mobx-react-devtools'

import NotesPage from 'web-client/notes/Page'
import ModalsContainer from 'web-client/modals/ModalsContainer'
import ToastsContainer from 'web-client/modals/ToastsContainer'

export class App extends React.Component<{}, {}> {
  render (): JSX.Element {
    let devTools: JSX.Element | undefined

    if (__DEV__) {
      const devToolsPosition = {
        bottom: 10,
        right: 10,
      }

      devTools = <DevTools position={devToolsPosition} />
    }

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
