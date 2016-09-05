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
        <small className="NoteRecord-time">
          {moment(record.update_ts * 1000).format('MMM DD YYYY')}
        </small>
      </li>
    )
  }

  onClick = () => {
    this.props.onClick(this.props.record.id)
  }
}

export default NoteRecord
