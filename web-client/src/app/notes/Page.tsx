import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'

import NotesStore, {Name} from './store'
import SearchBox from './SearchBox'
import NoteRecordsList from './NoteRecordsList'
import NotesList from './NotesList'
import AddNoteModal from './AddNoteModal'
import LinkButton from 'common/LinkButton'

interface IProps {
  store: NotesStore,
}

@observer
class NotesPage extends React.Component<IProps, {}> {
  @observable showAddNoteModal: boolean = false

  @action showModal(show: boolean): void {
    this.showAddNoteModal = show
  }

  render (): JSX.Element {
    const { store } = this.props

    let modal: JSX.Element | undefined
    if (this.showAddNoteModal) {
      modal = (
        <AddNoteModal onCreate={this.onCreateNote}
                      onCancel={this.onModalCancel} />
      )
    }

    return (
      <div className="NotesPage">
        {modal}
        <div className="NotesPage-left">
          <SearchBox store={store} />
          <NoteRecordsList store={store} />
        </div>
        <div className="NotesPage-center">
          <NotesList store={store} />

          <LinkButton className="NotesPage-plus"
                      onClick={this.onClickPlus} >
            Add Note
          </LinkButton>
        </div>
      </div>
    )
  }

  onClickPlus = () => {
    this.showModal(true)
  }

  onModalCancel = () => {
    this.showModal(false)
  }

  onCreateNote = (name: Name) => {
    this.props.store.createNote(name).then(() => this.showModal(false))
  }
}

export default NotesPage
