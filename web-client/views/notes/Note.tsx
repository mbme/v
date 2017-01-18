import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import {Inject} from 'web-client/utils'
import Store from 'web-client/store'
import {Note as NoteEntity} from 'web-client/utils/types'

import { Button } from 'web-client/components'
import FileLink from './FileLink'

interface IProps {
  note: NoteEntity,
}

@observer
class Note extends React.Component<IProps, {}> {
  @Inject store: Store

  render (): JSX.Element {
    const { note } = this.props

    const files = note.files.map(
      file => <FileLink key={file.name} noteId={note.id} file={file} />
    )

    return (
      <div className="Note">
        <div className="Note-toolbar">
          <Button onClick={this.onClickEdit}>Edit</Button>
          <Button onClick={this.onClickClose}>Close</Button>
        </div>
        <h1 className="Note-name">{note.name}</h1>
        <div className="Note-data">{note.data}</div>
        <div className={cx('Note-files', { 'is-hidden': !files.length })}>{files}</div>
      </div>
    )
  }

  onClickClose = () => {
    this.store.closeNote(this.props.note.id)
  }

  onClickEdit = () => {
    this.props.note.edit(true)
  }
}

export default Note
