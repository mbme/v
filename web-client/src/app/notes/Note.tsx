import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import {Note as NoteEntity} from './store'
import LinkButton from 'common/LinkButton'
import FileLink from './FileLink'

interface IProps {
  note: NoteEntity,
  onClose: () => void,
  onEdit: () => void,
}

@observer
class Note extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props

    const files = note.files.map(
      file => <FileLink key={file.name} noteId={note.id} file={file} />
    )

    return (
      <div className="Note">
        <div className="Note-toolbar">
          <LinkButton onClick={this.onClickEdit}>Edit</LinkButton>
          <LinkButton onClick={this.onClickClose}>Close</LinkButton>
        </div>
        <h1 className="Note-name">{note.name}</h1>
        <div className="Note-data">{note.data}</div>
        <div className={cx('Note-files', { 'is-hidden': !files.length })}>{files}</div>
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
