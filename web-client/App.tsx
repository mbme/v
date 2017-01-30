import * as React from 'react'
import * as cx from 'classnames'

import {computed} from 'mobx'
import {observer} from 'mobx-react'

import DevTools from 'mobx-react-devtools'

import { uiStore } from 'web-client/store'

import { Toast } from 'web-client/components'

import NotesView from 'web-client/views/notes'
import TodosView from 'web-client/views/todos'

@observer
export default class App extends React.Component<{}, {}> {
  @computed get currentView(): JSX.Element {
    switch (uiStore.view) {
      case 'notes':
        return <NotesView />

      case 'todos':
        return <TodosView />

      default:
        throw new Error(`unexpected view ${uiStore.view}`)
    }
  }

  @computed get modalsContainer(): JSX.Element {
    const modal = uiStore.visibleModal

    return (
      <div className={cx('ModalsContainer', { 'is-hidden': !modal })}>
        <div className="ModalsContainer-backdrop"></div>
        {modal ? modal.el : undefined}
      </div>
    )
  }

  @computed get toastsContainer(): JSX.Element {
    const toasts = uiStore.toasts.map(
      toast => <Toast key={toast.id} toast={toast} />
    )

    return (
      <div className="ToastsContainer">
        {toasts}
      </div>
    )
  }

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
        {this.currentView}
        {this.modalsContainer}
        {this.toastsContainer}
        {devTools}
      </div>
    )
  }
}
