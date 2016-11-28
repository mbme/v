import * as React from 'react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

class Header extends React.Component<{}, {}> {
  @Inject store: Store

  render (): JSX.Element {
    return (
      <header className="Header">
        <div className="Header-link" onClick={() => this.store.setView('notes')}>Notes</div>
        <div className="Header-link" onClick={() => this.store.setView('todos')}>Todos</div>
        <div className="Header-right">{this.props.children}</div>
      </header>
    )
  }
}

export default Header
