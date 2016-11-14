import * as React from 'react'
import {observer} from 'mobx-react'

import {InjectStore} from 'web-client/injector'
import NotesStore from './store'

import NoteView from './Note'
import NoteEditor from './NoteEditor'

@observer
class NotesList extends React.Component<{}, {}> {
  @InjectStore store: NotesStore

  render (): JSX.Element {
    const notes = this.store.openNotes.map(
      (note) => note.editMode
            ? <NoteEditor key={note.id} note={note} />
            : <NoteView key={note.id} note={note} />
    )

    return (
      <div className="NotesList">
        {notes}
      </div>
    )
  }
}

export default NotesList
