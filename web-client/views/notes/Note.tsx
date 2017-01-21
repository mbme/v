import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import { STORE } from 'web-client/store'
import {Note as NoteEntity} from 'web-client/utils/types'

import { Button } from 'web-client/components'
import FileLink from './FileLink'

interface IProps {
  note: NoteEntity,
}

@observer
export default class Note extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props

    const files = note.files.map(
      file => <FileLink key={file.name} noteId={note.id} file={file} />
    )

    return (
      <div className="Note">
        <div className="Note-toolbar">
          <Button onClick={() => note.edit(true)}>Edit</Button>
          <Button onClick={() => STORE.closeNote(note.id)}>Close</Button>
        </div>
        <h1 className="Note-name">{note.name}</h1>
        <div className="Note-data">{note.data}</div>
        <div className={cx('Note-files', { 'is-hidden': !files.length })}>{files}</div>
      </div>
    )
  }
}
