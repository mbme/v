import {observer} from 'mobx-react'
import * as React from 'react'
import {INote, Id} from './store'
import LinkButton from 'common/LinkButton'

interface IProps {
  note: INote,
  onClose: (id: Id) => void,
}

@observer
class Note extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props
    return (
      <div className="Note">
        <div className="Toolbar">
          <LinkButton onClick={this.onClickClose}>Close</LinkButton>
        </div>
        <h1 className="Note-title">{note.name}</h1>
        <div className="Note-body">{note.data}</div>
      </div>
    )
  }

  onClickClose = () => {
    this.props.onClose(this.props.note.id)
  }
}

export default Note
