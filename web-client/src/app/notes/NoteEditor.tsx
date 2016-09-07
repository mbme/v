import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import {Note as NoteEntity, Name, Data} from './store'
import LinkButton from 'common/LinkButton'
import FileLink from './FileLink'

import DeleteNoteModal from './DeleteNoteModal'
import CloseEditorModal from './CloseEditorModal'

interface IProps {
  note: NoteEntity,
  onDelete: () => void,
  onSave: (name: Name, data: Data) => void,
  onCloseEditor: () => void,
}

type ModalState = 'deleteNote' | 'closeEditor' | 'hidden'

@observer
class NoteEditor extends React.Component<IProps, {}> {
  @observable modalState: ModalState = 'hidden'

  @action changeModalState(state: ModalState): void {
    this.modalState = state
  }

  render (): JSX.Element {
    const { note } = this.props

    const files = note.files.map(
      file => <FileLink key={file.name} noteId={note.id} file={file} />
    )

    return (
      <div className="NoteEditor">

        <div className="NoteEditor-toolbar">
          <LinkButton onClick={this.onClickSave}>Save</LinkButton>
          <LinkButton type="dangerous" onClick={this.onClickDelete}>Delete</LinkButton>
          <LinkButton type="secondary" onClick={this.onClickCloseEditor}>Close editor</LinkButton>

          <DeleteNoteModal isVisible={this.modalState === 'deleteNote'}
                           name={note.name}
                           onCancel={this.hideModal}
                           onDelete={this.props.onDelete} />

          <CloseEditorModal isVisible={this.modalState === 'closeEditor'}
                            name={note.name}
                            onCancel={this.hideModal}
                            onClose={this.props.onCloseEditor} />
        </div>

        <input className="NoteEditor-name"
               ref="name"
               type="text"
               placeholder="Name"
               defaultValue={note.name} />

        <textarea className="NoteEditor-data"
                  ref="data"
                  placeholder="Type something here"
                  defaultValue={note.data} />

        <div className="NoteEditor-files">{files}</div>
      </div>
    )
  }

  getNameInputValue(): string {
    return (this.refs['name'] as HTMLInputElement).value
  }

  getDataTextareaValue(): string {
    return (this.refs['data'] as HTMLTextAreaElement).value
  }

  onClickSave = () => {
    const name = this.getNameInputValue()
    const data = this.getDataTextareaValue()

    this.props.onSave(name, data)
  }

  onClickDelete = () => {
    this.changeModalState('deleteNote')
  }

  hideModal = () => {
    this.changeModalState('hidden')
  }

  onClickCloseEditor = () => {
    const name = this.getNameInputValue()
    const data = this.getDataTextareaValue()
    const { note } = this.props

    // do not show modal if there are no changes
    if (note.name === name && note.data === data) {
      this.props.onCloseEditor() // just close editor
      return
    }

    this.changeModalState('closeEditor')
  }
}

export default NoteEditor
