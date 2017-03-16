import * as React from 'react'
import * as cx from 'classnames'

import { uiStore } from 'web-client/store'
import { ViewTypes } from 'web-client/utils/types'

interface ILayoutProps {
  className?: string,
  children?: any,
}

function createLayoutPart(baseClass: string) {
  return ({ className, children }: ILayoutProps) => (
    <div className={cx(baseClass, className)}>{ children }</div>
  )
}

export const Page = createLayoutPart('Page')
export const LeftPane = createLayoutPart('LeftPane')
export const MiddlePane = createLayoutPart('MiddlePane')
export const Content = createLayoutPart('Content')
export const Toolbar = createLayoutPart('Toolbar')

export class Header extends React.Component<{}, {}> {
  renderLink(view: ViewTypes, text: string): JSX.Element {
    const classes = cx('Header-link', { 'is-active': uiStore.view === view })
    return (
      <div className={classes} onClick={() => uiStore.view = view}>{text}</div>
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
