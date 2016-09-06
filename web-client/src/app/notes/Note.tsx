import {observer} from 'mobx-react'
import * as React from 'react'
import {INote} from './store'
import LinkButton from 'common/LinkButton'

interface IProps {
  note: INote,
  onClose: () => void,
  onEdit: () => void,
}

@observer
class Note extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props
    return (
      <div className="Note">
        <div className="Toolbar">
          <LinkButton onClick={this.onClickEdit}>Edit</LinkButton>
          <LinkButton onClick={this.onClickClose}>Close</LinkButton>
        </div>
        <h1 className="Note-name">{note.name}</h1>
        <div className="Note-data">{note.data}</div>
      </div>
    )
  }

  onClickClose = () => {
    this.props.onClose()
  }

  onClickEdit = () => {
    this.props.onEdit()
  }
}

export default Note
