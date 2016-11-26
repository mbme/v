import * as React from 'react'

import {observer} from 'mobx-react'

import DevTools from 'mobx-react-devtools'

import { Store, NoteRecord } from 'web-client/store'
import UIStore from 'web-client/ui-store'

interface IProps {
  store: UIStore,
}

@observer
class App extends React.Component<IProps, {}> {
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
        <div className="AppContainer">
          {this.props.store.pieces}
        </div>
        {devTools}
      </div>
    )
  }
}

@observer
class TestComponent extends React.Component<{ records: NoteRecord[] }, {}> {
  render (): JSX.Element {
    return (
      <h1>TEST {this.props.records.length}</h1>
    )
  }
}

export function createApp(store: Store): JSX.Element {
  const uiStore = new UIStore()

  store.loadNoteRecords()
  uiStore.addPiece(
    <TestComponent records={store.noteRecords} />
  )

  return (
    <App store={uiStore} />
  )
}
