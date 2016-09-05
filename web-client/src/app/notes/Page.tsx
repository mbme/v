import * as React from 'react'
import {observer} from 'mobx-react'

import NotesStore from './store'
import SearchBox from './SearchBox'
import NoteRecordsList from './NoteRecordsList'
import NotesList from './NotesList'

interface IProps {
  store: NotesStore,
}

@observer
class NotesPage extends React.Component<IProps, {}> {

  render (): JSX.Element {
    const { store } = this.props
    return (
      <div className="NotesPage">
        <div className="NotesPage-left">
          <SearchBox store={store} />
          <NoteRecordsList store={store} />
        </div>
        <div className="NotesPage-center">
          <NotesList store={store} />
        </div>
      </div>
    )
  }

}

export default NotesPage
