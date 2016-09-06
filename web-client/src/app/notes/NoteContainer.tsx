import {observer} from 'mobx-react'
import * as React from 'react'
import NotesStore, {Note as NoteEntity, Name, Data} from './store'
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
                         onCancel={this.onClickCancel} />
    } else {
      return <NoteView note={note}
                       onEdit={this.onClickEdit}
                       onClose={this.onClickClose} />
    }
  }

  onClickClose = () => {
    this.props.store.closeNote(this.props.note.id)
  }

  onClickEdit = () => {
    this.props.note.edit(true)
  }

  onClickSave = (name: Name, data: Data) => {
    this.props.store.updateNote(this.props.note.id, name, data).then(
      () => this.props.note.edit(false)
    )
  }

  onClickCancel = () => {
    // FIXME modal dialog here
    this.props.note.edit(false)
  }
}

export default NoteContainer
