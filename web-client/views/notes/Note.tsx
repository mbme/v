import {observer} from 'mobx-react'
import * as React from 'react'

import { INote } from 'api-client/types'

import Toolbar, { IAction } from './Toolbar'

interface IProps {
  note: INote,
  onClose: () => void,
  onEdit: () => void,
}

@observer
export default class Note extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note, onEdit, onClose } = this.props

    const actions: IAction[] = [
      { label: 'Close', action: onClose},
      { label: 'Edit', action: onEdit},
    ]

    return (
      <div className="NoteContainer">
        <div className="Note">
          <h1 className="Note-name">{note.name}</h1>
          <div className="Note-data">{note.data}</div>
        </div>

        <Toolbar recordId={note.id} edit={false} actions={actions} />
      </div>
    )
  }
}
