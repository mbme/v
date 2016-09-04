import * as React from 'react'
import {observer} from 'mobx-react'

import './styles.css'

import NotesStore, { Id } from './store'
import NoteRecord from './NoteRecord'

interface IProps {
  store: NotesStore,
}

@observer
class NotesPage extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const items = this.props.store.records.map(
      record => <NoteRecord key={record.id} record={record} onClick={this.onItemClick} />
    )
    return (
      <div className="NotesPage">
        <div className="NotesPage-left">
          <ul>{items}</ul>
        </div>
        <div className="NotesPage-center">
          <h1>HELLO WORLD</h1>
        </div>
      </div>
    )
  }

  onItemClick = (id: Id) => {
    /* console.error(id)*/
  }

}

export default NotesPage
