import * as React from 'react'
import * as cx from 'classnames'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'
import { ViewTypes } from 'web-client/types'

export class Header extends React.Component<{}, {}> {
  @Inject store: Store

  renderLink(view: ViewTypes, text: string): JSX.Element {
    const classes = cx('Header-link', { 'is-active': this.store.view === view })
    return (
      <div className={classes} onClick={() => this.store.setView('notes')}>{text}</div>
    )
  }

  render (): JSX.Element {
    return (
      <header className="Header">
        {this.renderLink('notes', 'Notes')}
        {this.renderLink('todos', 'Todos')}
        <div className="Header-right">{this.props.children}</div>
      </header>
    )
  }
}
