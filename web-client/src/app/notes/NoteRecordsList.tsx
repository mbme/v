import * as React from 'react'
import {observer} from 'mobx-react'

import {Id} from 'types'
import NotesStore from './store'
import NoteRecord from './NoteRecord'

interface IProps {
  store: NotesStore,
}

@observer
class NoteRecordsList extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const records = this.props.store.records.map(
      record => <NoteRecord key={record.id} record={record} onClick={this.onItemClick} />
    )

    return (
      <ul className="NoteRecordsList">
        {records}
      </ul>
    )
  }

  onItemClick = (id: Id) => {
    this.props.store.openNote(id)
  }

}

export default NoteRecordsList
