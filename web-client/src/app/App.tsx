import * as React from 'react'
import {Provider} from 'mobx-react'
import DevTools from 'mobx-react-devtools'

import AppState from 'AppState'
import NotesPage from 'notes/Page'
import ModalsContainer from 'modals/ModalsContainer'

interface IProps {
  state: AppState,
}

export type AppType = React.ComponentClass<IProps>

class App extends React.Component<IProps, {}> {
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

export default App
