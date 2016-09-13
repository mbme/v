import * as React from 'react'
import {observable, action, asReference} from 'mobx'
import {observer} from 'mobx-react'

import {Name} from 'types'
import {InjectStore} from 'AppState'

import NotesStore from 'notes/store'
import ModalsStore from 'modals/store'

import SearchBox from './SearchBox'
import NoteRecordsList from './NoteRecordsList'
import NotesList from './NotesList'
import AddNoteModal from './AddNoteModal'
import LinkButton from 'common/LinkButton'

@observer
class NotesPage extends React.Component<{}, {}> {
  @InjectStore notesStore: NotesStore
  @InjectStore modalsStore: ModalsStore

  @observable modal: JSX.Element | undefined = asReference(undefined)

  @action showModal(modal?: JSX.Element): void {
    this.modal = modal
  }

  componentWillMount(): void { // FIXME load notes in router when opening the page
    this.notesStore.loadRecordsList()
        .catch(err => this.modalsStore.showErrorToast('Failed to load records list', err))
  }

  render (): JSX.Element {
    return (
      <div className="NotesPage">
        {this.modal}
        <div className="NotesPage-left">
          <SearchBox />
          <NoteRecordsList />
        </div>
        <div className="NotesPage-center">
          <NotesList />

          <LinkButton className="NotesPage-plus"
                      onClick={this.onClickPlus} >
            Add Note
          </LinkButton>
        </div>
      </div>
    )
  }

  onClickPlus = () => {
    this.showModal(
      <AddNoteModal onCreate={this.onCreateNote}
                    onCancel={this.onModalCancel} />
    )
  }

  onModalCancel = () => {
    this.showModal()
  }

  onCreateNote = (name: Name) => {
    this.notesStore.createNote(name).then(() => this.showModal())
  }
}

export default NotesPage
