import {observer} from 'mobx-react'
import * as React from 'react'
import {NoteRecord as NRecord, Id} from './store'
import * as moment from 'moment'
import * as cx from 'classnames'

interface IProps {
  record: NRecord,
  onClick: (id: Id) => void,
}

function formatTime(ts: number): string {
  return moment.unix(ts).format('MMM DD YYYY')
}

@observer
class NoteRecord extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { record } = this.props
    const className = cx(
      'NoteRecord', {
        'is-open': record.isOpen,
        'is-hidden': !record.isVisible
      }
    )
    return (
      <li className={className} onClick={this.onClick}>
        <div className="NoteRecord-title">{record.name}</div>
        <small className="NoteRecord-time">{formatTime(record.updateTs)}</small>
      </li>
    )
  }

  onClick = () => {
    this.props.onClick(this.props.record.id)
  }
}

export default NoteRecord
