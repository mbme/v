import * as React from 'react'
import {observable, action} from 'mobx'
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
export default class NotesPage extends React.Component<{}, {}> {
  @InjectStore notesStore: NotesStore

  @observable showModal: boolean = false

  @action
  setShowModal(show: boolean): void {
    this.showModal = show
  }

  render (): JSX.Element {
    return (
      <div className="NotesPage">
        <AddNoteModal
            show={this.showModal}
            onCreate={this.onCreateNote}
            onCancel={this.onModalCancel} />
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
    this.setShowModal(true)
  }

  onModalCancel = () => {
    this.setShowModal(false)
  }

  onCreateNote = (name: string) => {
    this.notesStore.createNote(name).then(() => this.setShowModal(false))
  }
}
