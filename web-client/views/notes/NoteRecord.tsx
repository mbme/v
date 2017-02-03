import * as React from 'react'
import {observer} from 'mobx-react'
import { IRecord } from 'api-client/types'
import * as moment from 'moment'
import * as cx from 'classnames'

interface IProps {
  record: IRecord,
  isOpen: boolean,
  isVisible: boolean,
  onClick: (id: number) => void,
}

function formatTime(ts: number): string {
  return moment.unix(ts).format('MMM DD YYYY')
}

@observer
class NoteRecord extends React.Component<IProps, {}> {

  onClick = () => {
    this.props.onClick(this.props.record.id)
  }

  render (): JSX.Element {
    const { record, isOpen, isVisible } = this.props
    const className = cx(
      'NoteRecord', {
        'is-open': isOpen,
        'is-hidden': !isVisible,
      }
    )
    return (
      <li className={className} onClick={this.onClick}>
        <div className="NoteRecord-title">{record.name}</div>
        <small className="NoteRecord-time">{formatTime(record.updateTs)}</small>
      </li>
    )
  }
}

export default NoteRecord
