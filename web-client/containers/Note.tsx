import * as React from 'react'
import {observer} from 'mobx-react'
import { Note as NoteEntity } from 'web-client/store'

interface IProps {
  openNotes: NoteEntity[],
  id: number,
}

@observer
export class Note extends React.Component<IProps, {}> {
  render(): JSX.Element {
    const { openNotes, id } = this.props

    const note = openNotes.find(item => item.id === id)

    if (!note) {
      return (
        <div className="Note">
          <div>LOADING</div>
        </div>
      )
    }

    return (
      <div className="Note">
        <h1>NOTE {note.id}</h1>
        <div>
          {JSON.stringify(note)}
        </div>
      </div>
    )
  }
}
