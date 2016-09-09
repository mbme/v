import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import {Note as NoteEntity, Name, Data} from './store'
import LinkButton from 'common/LinkButton'
import FilePicker from './FilePicker'
import FileLink from './FileLink'

import DeleteNoteModal from './DeleteNoteModal'
import CloseEditorModal from './CloseEditorModal'
import UploadFileModal from './UploadFileModal'

interface IProps {
  note: NoteEntity,
  onDelete: () => void,
  onSave: (name: Name, data: Data) => void,
  onFileUpload: (name: string, file: File) => Promise<void>,
  onCloseEditor: () => void,
}

class UploadFileState {
  files: File[] = []
  constructor(files: FileList) {
    for (let i = 0; i < files.length; i += 1) {
      this.files.push(files[i])
    }
  }
}

type ModalState = 'hidden' | 'deleteNote' | 'closeEditor' | UploadFileState

@observer
class NoteEditor extends React.Component<IProps, {}> {
  @observable modalState: ModalState = 'hidden'

  @action changeModalState(state: ModalState): void {
    this.modalState = state
  }

  renderModals (): JSX.Element | undefined {
    switch (this.modalState) {
      case 'deleteNote':
        return (
          <DeleteNoteModal name={this.props.note.name}
                           onCancel={this.hideModal}
                           onDelete={this.props.onDelete} />
        )
      case 'closeEditor':
        return (
          <CloseEditorModal name={this.props.note.name}
                            onCancel={this.hideModal}
                            onClose={this.props.onCloseEditor} />
        )
      default:
        if (this.modalState instanceof UploadFileState) {
          return (
            <UploadFileModal noteName={this.props.note.name}
                             file={this.modalState.files[0]}
                             onClose={this.hideModal}
                             onCancel={this.hideModal}
                             onUpload={this.props.onFileUpload} />
          )
        }
    }
  }

  render (): JSX.Element {
    const { note } = this.props

    const files = note.files.map(
      file => <FileLink key={file.name} noteId={note.id} file={file} />
    )

    return (
      <div className="NoteEditor">
        {this.renderModals()}
        <div className="NoteEditor-toolbar">
          <LinkButton onClick={this.onClickSave}>Save</LinkButton>
          <LinkButton type="dangerous" onClick={this.onClickDelete}>Delete</LinkButton>
          <LinkButton type="secondary" onClick={this.onClickCloseEditor}>Close editor</LinkButton>
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

        <FilePicker label="Attach file"
                    onFilesPicked={this.onFilesPicked} />

        <div className={cx('NoteEditor-files', { 'is-hidden': !files.length })}>{files}</div>
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

  onFilesPicked = (files: FileList) => {
    this.changeModalState(new UploadFileState(files))
  }
}

export default NoteEditor
