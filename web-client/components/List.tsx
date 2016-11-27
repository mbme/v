import * as React from 'react'
import {observer} from 'mobx-react'
import { IListItem } from './types'
import * as cx from 'classnames'

interface IProps {
  className?: string,
  items: IListItem[],
}

@observer
export class List extends React.Component<IProps, {}> {

  render(): JSX.Element {
    return (
      <ul className={cx('List', this.props.className)}>
        {this.props.items.map(
           ({ el, key, onClick }) => <li key={key} onClick={onClick}>{el}</li>)
        }
      </ul>
    )
  }
}
