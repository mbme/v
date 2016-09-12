import * as React from 'react'
import {observer} from 'mobx-react'

import {Id} from 'types'
import {InjectStore} from 'AppState'

import NotesStore from './store'
import NoteRecord from './NoteRecord'

@observer
class NoteRecordsList extends React.Component<{}, {}> {
  @InjectStore store: NotesStore

  render (): JSX.Element {
    const records = this.store.records.map(
      record => <NoteRecord key={record.id} record={record} onClick={this.onItemClick} />
    )

    return (
      <ul className="NoteRecordsList">
        {records}
      </ul>
    )
  }

  onItemClick = (id: Id) => {
    this.store.openNote(id)
  }

}

export default NoteRecordsList
