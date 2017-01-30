import * as React from 'react'
import * as cx from 'classnames'

import { uiStore } from 'web-client/store'
import { ViewTypes } from 'web-client/utils/types'

export class Header extends React.Component<{}, {}> {
  renderLink(view: ViewTypes, text: string): JSX.Element {
    const classes = cx('Header-link', { 'is-active': uiStore.view === view })
    return (
      <div className={classes} onClick={() => uiStore.setView(view)}>{text}</div>
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
