import {observer} from 'mobx-react'
import {toJS} from 'mobx'
import * as React from 'react'
import NotesStore from './store'

interface INotesPageProps {
  store: NotesStore,
}

@observer
class NotesPage extends React.Component<INotesPageProps, {}> {

  render (): JSX.Element {
    const items = this.props.store.records.map(
      record => <li key={record.id}>{JSON.stringify(toJS(record))}</li>
    )
    return (
      <div>
        <h1>HELLO WORLD</h1>
        <ul>{items}</ul>
      </div>
    )
  }

}

export default NotesPage
