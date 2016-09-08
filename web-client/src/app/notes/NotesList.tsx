import * as React from 'react'
import {observer} from 'mobx-react'

import NotesStore from './store'
import NoteContainer from './NoteContainer'

interface IProps {
  store: NotesStore,
}

@observer
class NotesList extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const notes = this.props.store.openNotes.map(
      note => <NoteContainer key={note.id}
                             note={note}
                             store={this.props.store} />
    )

    return (
      <div className="NotesList">
        {notes}
      </div>
    )
  }
}

export default NotesList
