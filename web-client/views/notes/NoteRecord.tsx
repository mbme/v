import {computed} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import {NoteRecord as NRecord} from 'web-client/utils/types'
import * as moment from 'moment'
import * as cx from 'classnames'

import {Inject} from 'web-client/utils'
import Store from 'web-client/store'

interface IProps {
  record: NRecord,
  onClick: (id: number) => void,
}

function formatTime(ts: number): string {
  return moment.unix(ts).format('MMM DD YYYY')
}

@observer
class NoteRecord extends React.Component<IProps, {}> {
  @Inject store: Store

  @computed get isOpen(): boolean {
    return this.store.indexOfNote(this.props.record.id) > -1
  }

  @computed get isVisible(): boolean {
    return this.store.visibleRecords.indexOf(this.props.record) > -1
  }

  render (): JSX.Element {
    const { record } = this.props
    const className = cx(
      'NoteRecord', {
        'is-open': this.isOpen,
        'is-hidden': !this.isVisible
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
