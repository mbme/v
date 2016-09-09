import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import * as config from 'config'
import {Note as NoteEntity, Name, Data, IFileInfo} from './store'
import LinkButton from 'common/LinkButton'
import FilePicker from './FilePicker'
import AttachmentEditor from './AttachmentEditor'

import DeleteNoteModal from './DeleteNoteModal'
import DeleteFileModal from './DeleteFileModal'
import CloseEditorModal from './CloseEditorModal'
import UploadFileModal from './UploadFileModal'

interface IProps {
  note: NoteEntity,
  onDelete: () => void,
  onSave: (name: Name, data: Data) => Promise<void>,
  onFileUpload: (name: string, file: File) => Promise<void>,
  onDeleteFile: (file: IFileInfo) => Promise<void>,
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

class DeleteFileState {
  constructor (public file: IFileInfo) {}
}

type ModalState = 'hidden' | 'deleteNote' | 'closeEditor' | UploadFileState | DeleteFileState

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

        if (this.modalState instanceof DeleteFileState) {
          return (
            <DeleteFileModal file={this.modalState.file}
                             onCancel={this.hideModal}
                             onDelete={this.onDeleteFile} />
          )
        }
    }
  }

  renderFiles(): JSX.Element[] {
    const { note } = this.props

    return note.files.map(
      file => (
        <AttachmentEditor key={file.name}
                          noteId={note.id}
                          file={file}
                          onRemove={this.onClickDeleteFile} />
      )
    )
  }

  render (): JSX.Element {
    const { note } = this.props

    const files = this.renderFiles()

    return (
      <div className="NoteEditor" onDrop={this.onDrop}>
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

        <div className={cx('NoteEditor-files', { 'is-hidden': !files.length })}>
          {files}
        </div>
      </div>
    )
  }

  getNameInputValue(): string {
    return (this.refs['name'] as HTMLInputElement).value
  }

  getDataTextareaValue(): string {
    return (this.refs['data'] as HTMLTextAreaElement).value
  }

  maybeCloseEditor = () => {
    if (config.closeEditorOnSave) {
      this.props.onCloseEditor()
    }
  }

  onClickSave = () => {
    const name = this.getNameInputValue()
    const data = this.getDataTextareaValue()

    // do not save if there are no changes
    if (this.props.note.name === name && this.props.note.data === data) {
      this.maybeCloseEditor()
      return
    }

    this.props.onSave(name, data).then(this.maybeCloseEditor)
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

  onDrop = (e: React.DragEvent<HTMLElement>) => {
    this.changeModalState(new UploadFileState(e.dataTransfer.files))
  }

  onClickDeleteFile = (file: IFileInfo) => {
    this.changeModalState(new DeleteFileState(file))
  }

  onDeleteFile = (file: IFileInfo) => {
    this.props.onDeleteFile(file).then(
      () => this.hideModal()
    )
  }
}

export default NoteEditor
