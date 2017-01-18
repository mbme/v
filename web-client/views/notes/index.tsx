import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'

import { Button, Header } from 'web-client/components'

import SearchBox from './SearchBox'
import NoteRecordsList from './NoteRecordsList'
import NotesList from './NotesList'
import AddNoteModal from './AddNoteModal'

@observer
export default class NotesView extends React.Component<{}, {}> {
  @Inject store: Store

  @observable showModal: boolean = false

  componentWillMount(): void {
    this.store.loadNotesList()
  }

  @action
  setShowModal(show: boolean): void {
    this.showModal = show
  }

  render (): JSX.Element {
    return (
      <div className="NotesView">
        <AddNoteModal
            show={this.showModal}
            onCreate={this.onCreateNote}
            onCancel={this.onModalCancel} />
        <Header>
          <Button onClick={this.onClickPlus}>Add Note</Button>
        </Header>
        <div className="NotesView-left">
          <SearchBox />
          <NoteRecordsList />
        </div>
        <div className="NotesView-center">
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
    this.store.createNote(name).then(() => this.setShowModal(false))
  }
}
