import {observable} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import { IconChevronRight, IconExpandMore } from '../Icon'

interface IProps {
  title: string,
  children?: JSX.Element,
  expanded?: boolean,
}

@observer
export class Expandable extends React.Component<IProps, {}> {
  @observable expanded: boolean

  constructor(props: IProps) {
    super(props)
    this.expanded = !!props.expanded
  }

  onClick = () => this.expanded = !this.expanded

  render (): JSX.Element {
    const { title, children } = this.props

    const icon = this.expanded ? <IconExpandMore /> : <IconChevronRight />

    return (
      <div className={cx('Expandable', { 'is-expanded': this.expanded })}>
        <div className="Expandable-title" onClick={this.onClick}>
          <span className="Expandable-icon">{icon}</span>
          {title}
        </div>
        <div className="Expandable-content">{children}</div>
      </div>
    )
  }
}
