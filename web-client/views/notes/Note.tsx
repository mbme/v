import {observer} from 'mobx-react'
import * as React from 'react'

import { notesStore } from 'web-client/store'
import { INote } from 'api-client/types'

import Toolbar, { IAction } from './Toolbar'

interface IProps {
  note: INote,
}

@observer
export default class Note extends React.Component<IProps, {}> {
  closeNote = () => notesStore.closeNote(this.props.note.id)

  editNote = () => notesStore.editNote(this.props.note.id)

  reloadNote = () => notesStore.loadNote(this.props.note.id)

  render (): JSX.Element {
    const { note } = this.props

    const actions: IAction[] = [
      { label: 'Close', action: this.closeNote},
      { label: 'Edit', action: this.editNote},
    ]

    return (
      <div className="NoteContainer">
        <div className="Note">
          <h1 className="Note-name">{note.name}</h1>
          <div className="Note-data">{note.data}</div>
        </div>

        <Toolbar recordId={note.id}
                 edit={false}
                 actions={actions}
                 files={note.files}
                 reloadFiles={this.reloadNote} />
      </div>
    )
  }
}
