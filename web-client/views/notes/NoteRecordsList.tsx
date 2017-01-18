import * as React from 'react'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/utils'
import Store from 'web-client/store'

import NoteRecord from './NoteRecord'

@observer
class NoteRecordsList extends React.Component<{}, {}> {
  @Inject store: Store

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

  onItemClick = (id: number) => {
    this.store.openNote(id)
  }

}

export default NoteRecordsList
