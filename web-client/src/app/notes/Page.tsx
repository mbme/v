import * as React from 'react'
import {observable, action} from 'mobx'
import {observer} from 'mobx-react'

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
  @observable showAddNoteModal: boolean = false

  @action showModal(show: boolean): void {
    this.showAddNoteModal = show
  }

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

          <LinkButton className="NotesPage-plus"
                      onClick={this.onClickPlus} >
            Add Note
          </LinkButton>

          <AddNoteModal isVisible={this.showAddNoteModal} />
        </div>
      </div>
    )
  }

  onClickPlus = () => {
    this.showModal(true)

    setTimeout(() => {
      this.showModal(false)
    }, 3000)
  }

}

export default NotesPage
