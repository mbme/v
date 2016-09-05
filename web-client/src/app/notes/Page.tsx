import * as React from 'react'
import {observer} from 'mobx-react'

import NotesStore, { Id } from './store'
import NoteRecord from './NoteRecord'
import Note from './Note'

interface IProps {
  store: NotesStore,
}

@observer
class NotesPage extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const records = this.props.store.records.map(
      record => <NoteRecord key={record.id} record={record} onClick={this.onItemClick} />
    )

    const notes = this.props.store.openNotes.map(
      note => <Note key={note.id} note={note} />
    )

    return (
      <div className="NotesPage">
        <div className="NotesPage-left">
          <ul>{records}</ul>
        </div>
        <div className="NotesPage-center">
          {notes}
        </div>
      </div>
    )
  }

  onItemClick = (id: Id) => {
    this.props.store.openNote(id)
  }

}

export default NotesPage
