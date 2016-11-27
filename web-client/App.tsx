import * as React from 'react'

import {observer} from 'mobx-react'
import DevTools from 'mobx-react-devtools'

import { Store } from 'web-client/store'
import UIStore from 'web-client/ui-store'

import {
  MainMenu,
  NotesList,
  Note,
} from 'web-client/containers'

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

  function showNote(id: number): void {
    store.openNote(id)
    uiStore.addPiece(
      `note-${id}`,
      <Note id={id} openNotes={store.openNotes} />
    )
  }

  function showNotes(): void {
    uiStore.addPiece(
      'noteRecords',
      <NotesList store={store} onClick={showNote} />
    )
  }

  const menuItems = [
    {
      key: 'notes',
      el: 'Notes',
      onClick: showNotes,
    }, {
      key: 'projects',
      el: 'Projects',
    }
  ]

  // ALWAYS VISIBLE ITEMS
  uiStore.addPiece(
    'mainMenu',
    <MainMenu items={menuItems} />
  )

  return (
    <App store={uiStore} />
  )
}
