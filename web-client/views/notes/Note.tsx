import {observer} from 'mobx-react'
import * as React from 'react'

import { notesStore } from 'web-client/store'
import {Note as NoteEntity} from 'web-client/utils/types'

import Toolbar, { IAction } from './Toolbar'

interface IProps {
  note: NoteEntity,
}

@observer
export default class Note extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props

    const actions: IAction[] = [
      { label: 'Close', action: () => notesStore.closeNote(note.id)},
      { label: 'Edit', action: () => note.edit(true)},
    ]

    return (
      <div className="NoteContainer">
        <div className="Note">
          <h1 className="Note-name">{note.name}</h1>
          <div className="Note-data">{note.data}</div>
        </div>

        <Toolbar note={note} actions={actions} />
      </div>
    )
  }
}
