import * as React from 'react'

import {autorun} from 'mobx'
import {observer} from 'mobx-react'
import DevTools from 'mobx-react-devtools'

import { Store } from 'web-client/store'
import UIStore from 'web-client/ui-store'

import { List } from 'web-client/components'

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
          {this.props.store.pieces.values()}
        </div>
        {devTools}
      </div>
    )
  }
}

export function createApp(store: Store): JSX.Element {
  const uiStore = new UIStore()

  store.loadNoteRecords()

  autorun(() => {
    uiStore.addPiece(
      'noteRecords',
      <List items={store.noteRecords.map(item => `${item.id} ${item.name}`)} />
    )
  })

  return (
    <App store={uiStore} />
  )
}
