import * as React from 'react'
import {observer} from 'mobx-react'

import NotesStore, {Id} from './store'
import Note from './Note'

interface IProps {
  store: NotesStore,
}

@observer
class NotesList extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const notes = this.props.store.openNotes.map(
      note => <Note key={note.id} note={note} onClose={this.closeNote} />
    )

    return (
      <div>
        {notes}
      </div>
    )
  }

  closeNote = (id: Id) => {
    this.props.store.closeNote(id)
  }

}

export default NotesList
