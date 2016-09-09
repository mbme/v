import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'
import * as config from 'config'
import {Name, IFileInfo} from 'types'
import {Note as NoteEntity, NoteData} from './store'
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
  onSave: (name: Name, data: NoteData) => Promise<void>,
  onFileUpload: (name: string, file: File) => Promise<void>,
  onDeleteFile: (file: IFileInfo) => Promise<void>,
  onCloseEditor: () => void,
}

@observer
class NoteEditor extends React.Component<IProps, {}> {
  @observable modal: JSX.Element | undefined

  @action changeModal(modal?: JSX.Element): void {
    this.modal = modal
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
        {this.modal}
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
    this.changeModal(
      <DeleteNoteModal name={this.props.note.name}
                       onCancel={this.hideModal}
                       onDelete={this.props.onDelete} />
    )
  }

  hideModal = () => {
    this.changeModal()
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

    this.changeModal(
      <CloseEditorModal name={note.name}
                        onCancel={this.hideModal}
                        onClose={this.props.onCloseEditor} />
    )
  }

  showFileUploadModal(files: FileList): void {
    this.changeModal(
      <UploadFileModal noteName={this.props.note.name}
                       file={files[0]}
                       onClose={this.hideModal}
                       onCancel={this.hideModal}
                       onUpload={this.props.onFileUpload} />
    )
  }

  onFilesPicked = (files: FileList) => {
    this.showFileUploadModal(files)
  }

  onDrop = (e: React.DragEvent<HTMLElement>) => {
    this.showFileUploadModal(e.dataTransfer.files)
  }

  onClickDeleteFile = (file: IFileInfo) => {
    this.changeModal(
      <DeleteFileModal file={file}
                       onCancel={this.hideModal}
                       onDelete={this.onDeleteFile} />
    )
  }

  onDeleteFile = (file: IFileInfo) => {
    this.props.onDeleteFile(file).then(
      () => this.hideModal()
    )
  }
}

export default NoteEditor
