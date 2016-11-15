import * as React from 'react'
import * as cx from 'classnames'

import {observer} from 'mobx-react'

import RoutingStore, { IPageName } from 'web-client/routingStore'
import {InjectStore} from 'web-client/injector'

interface IProps {
  className?: string,
  to: IPageName,
}

@observer
class Link extends React.Component<IProps, {}> {
  @InjectStore routingStore: RoutingStore

  render (): JSX.Element {
    const isActive = this.routingStore.page.name === this.props.to

    return (
      <a className={cx('Link', this.props.className, { 'is-active': isActive })}
         onClick={this.onClick}
         href="">
        {this.props.children}
      </a>
    )
  }

  onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    this.routingStore.openPage(this.props.to)
  }
}

export default Link
