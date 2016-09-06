import {observer} from 'mobx-react'
import {observable, action} from 'mobx'
import * as React from 'react'
import NotesStore, {INote, Name, Data} from './store'
import Note from './Note'
import NoteEditor from './NoteEditor'

interface IProps {
  note: INote,
  store: NotesStore,
}

type Mode = 'view' | 'edit'

@observer
class NoteContainer extends React.Component<IProps, {}> {
  @observable mode: Mode = 'view'

  render (): JSX.Element {
    const { note } = this.props

    if (this.mode === 'view') {
      return <Note note={note}
                   onEdit={this.onClickEdit}
                   onClose={this.onClickClose} />
    } else if (this.mode === 'edit') {
      return <NoteEditor note={note}
                         onSave={this.onClickSave}
                         onCancel={this.onClickCancel} />
    } else {
      throw new Error('should never get here')
    }
  }

  @action
  changeMode (mode: Mode): void {
    this.mode = mode
  }

  onClickClose = () => {
    this.props.store.closeNote(this.props.note.id)
  }

  onClickEdit = () => {
    this.changeMode('edit')
  }

  onClickSave = (name: Name, data: Data) => {
    this.props.store.updateNote(this.props.note.id, name, data).then(
      () => this.changeMode('view')
    )
  }

  onClickCancel = () => {
    // FIXME modal dialog here
    this.changeMode('view')
  }
}

export default NoteContainer
