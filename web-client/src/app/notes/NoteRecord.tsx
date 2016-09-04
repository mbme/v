import {observer} from 'mobx-react'
import * as React from 'react'
import {INoteRecord, Id} from './store'
import * as moment from 'moment'

interface IProps {
  record: INoteRecord,
  onClick: (id: Id) => void,
}

@observer
class NoteRecord extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { record } = this.props
    return (
      <li className="NoteRecord" onClick={this.onClick}>
        <div className="NoteRecord-title">{record.name}</div>
        <div className="NoteRecord-time">
          {moment(record.update_ts * 1000).format('MMM DD YYYY HH:mm')}
        </div>
      </li>
    )
  }

  onClick = () => {
    this.props.onClick(this.props.record.id)
  }
}

export default NoteRecord
