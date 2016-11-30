import * as React from 'react'
import * as cx from 'classnames'

import {computed} from 'mobx'
import {observer} from 'mobx-react'

import DevTools from 'mobx-react-devtools'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

import { Toast } from 'web-client/common'

import NotesView from 'web-client/notes/View'
import TodosView from 'web-client/todos/View'

@observer
export default class App extends React.Component<{}, {}> {
  @Inject store: Store

  @computed get currentView(): JSX.Element {
    switch (this.store.view) {
      case 'notes':
        return <NotesView />

      case 'todos':
        return <TodosView />

      default:
        throw new Error(`unexpected view ${this.store.view}`)
    }
  }

  @computed get modalsContainer(): JSX.Element {
    const modal = this.store.visibleModal

    return (
      <div className={cx('ModalsContainer', { 'is-hidden': !modal })}>
        <div className="ModalsContainer-backdrop"></div>
        {modal ? modal.el : undefined}
      </div>
    )
  }

  @computed get toastsContainer(): JSX.Element {
    const toasts = this.store.toasts.map(
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
        <div className="ViewContainer">
          {this.currentView}
        </div>
        {this.modalsContainer}
        {this.toastsContainer}
        {devTools}
      </div>
    )
  }
}
