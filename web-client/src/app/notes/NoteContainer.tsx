import {observer} from 'mobx-react'
import * as React from 'react'
import NotesStore, {Note as NoteEntity, Name, Data, FileName} from './store'
import NoteView from './Note'
import NoteEditor from './NoteEditor'

interface IProps {
  note: NoteEntity,
  store: NotesStore,
}

@observer
class NoteContainer extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props

    if (note.editMode) {
      return <NoteEditor note={note}
                         onSave={this.onClickSave}
                         onDelete={this.onClickDelete}
                         onFileUpload={this.onFileUpload}
                         onCloseEditor={this.onCloseEditor} />
    } else {
      return <NoteView note={note}
                       onEdit={this.onClickEdit}
                       onClose={this.onClickClose} />
    }
  }

  onClickClose = () => {
    this.props.store.closeNote(this.props.note.id)
  }

  onClickDelete = () => {
    this.props.store.deleteNote(this.props.note.id)
  }

  onClickEdit = () => {
    this.props.note.edit(true)
  }

  onClickSave = (name: Name, data: Data) => {
    this.props.store.updateNote(this.props.note.id, name, data).then(
      () => this.props.note.edit(false)
    )
  }

  onCloseEditor = () => {
    this.props.note.edit(false)
  }

  onFileUpload = (name: FileName, file: File): Promise<void> => {
    return this.props.store.uploadFile(this.props.note.id, name, file)
  }
}

export default NoteContainer
