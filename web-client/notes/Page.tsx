import * as React from 'react'
import {observable, action, asReference} from 'mobx'
import {observer} from 'mobx-react'

import {InjectStore} from 'web-client/injector'

import NotesStore from 'web-client/notes/store'

import LinkButton from 'web-client/common/LinkButton'
import Header from 'web-client/common/Header'

import SearchBox from './SearchBox'
import NoteRecordsList from './NoteRecordsList'
import NotesList from './NotesList'
import AddNoteModal from './AddNoteModal'

@observer
class NotesPage extends React.Component<{}, {}> {
  @InjectStore notesStore: NotesStore

  @observable modal: JSX.Element | undefined = asReference(undefined)

  @action showModal(modal?: JSX.Element): void {
    this.modal = modal
  }

  render (): JSX.Element {
    return (
      <div className="NotesPage">
        {this.modal}
        <Header>
          <LinkButton className="NotesPage-plus"
                      onClick={this.onClickPlus} >
            Add Note
          </LinkButton>
        </Header>
        <div className="NotesPage-left">
          <SearchBox />
          <NoteRecordsList />
        </div>
        <div className="NotesPage-center">
          <NotesList />
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

  onCreateNote = (name: string) => {
    this.notesStore.createNote(name).then(() => this.showModal())
  }
}

export default NotesPage
