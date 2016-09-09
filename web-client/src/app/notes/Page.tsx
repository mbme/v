import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'

import {Name} from 'types'
import NotesStore from './store'
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
  @observable modal: JSX.Element | undefined

  @action showModal(modal?: JSX.Element): void {
    this.modal = modal
  }

  render (): JSX.Element {
    const { store } = this.props

    return (
      <div className="NotesPage">
        {this.modal}
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
    this.showModal(
      <AddNoteModal onCreate={this.onCreateNote}
                    onCancel={this.onModalCancel} />
    )
  }

  onModalCancel = () => {
    this.showModal()
  }

  onCreateNote = (name: Name) => {
    this.props.store.createNote(name).then(() => this.showModal())
  }
}

export default NotesPage
