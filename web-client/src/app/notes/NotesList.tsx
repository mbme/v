import * as React from 'react'
import {observer} from 'mobx-react'

import NotesStore from './store'
import Note from './Note'

interface IProps {
  store: NotesStore,
}

@observer
class NotesList extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const notes = this.props.store.openNotes.map(
      note => <Note key={note.id} note={note} />
    )

    return (
      <div>
        {notes}
      </div>
    )
  }

}

export default NotesList
