import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

import NoteView from './Note'
import NoteEditor from './NoteEditor'

@observer
class NotesList extends React.Component<{}, {}> {
  @Inject store: Store

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
