import {observable, action, asReference} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import * as config from 'web-client/config'
import {IFileInfo} from 'api-client/types'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'
import {Note as NoteEntity} from 'web-client/types'

import LinkButton from 'web-client/common/LinkButton'
import FilePicker from './FilePicker'
import AttachmentEditor from './AttachmentEditor'

import DeleteNoteModal from './DeleteNoteModal'
import DeleteFileModal from './DeleteFileModal'
import CloseEditorModal from './CloseEditorModal'
import UploadFileModal from './UploadFileModal'

interface IProps {
  note: NoteEntity,
}

@observer
class NoteEditor extends React.Component<IProps, {}> {
  @Inject store: Store

  @observable modal: JSX.Element | undefined = asReference(undefined)

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
      this.closeEditor()
    }
  }

  closeEditor = () => {
    this.props.note.edit(false)
  }

  onClickSave = () => {
    const name = this.getNameInputValue()
    const data = this.getDataTextareaValue()

    // do not save if there are no changes
    if (this.props.note.name === name && this.props.note.data === data) {
      this.maybeCloseEditor()
      return
    }

    this.store.updateNote(this.props.note.id, name, data)
        .then(this.maybeCloseEditor)
  }

  onClickDelete = () => {
    this.changeModal(
      <DeleteNoteModal name={this.props.note.name}
                       onCancel={this.hideModal}
                       onDelete={this.deleteNote} />
    )
  }

  deleteNote = () => {
    const { note } = this.props
    this.store.deleteNote(note.id)
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
      this.closeEditor() // just close editor
      return
    }

    this.changeModal(
      <CloseEditorModal name={note.name}
                        onCancel={this.hideModal}
                        onClose={this.closeEditor} />
    )
  }

  showFileUploadModal(files: FileList): void {
    this.changeModal(
      <UploadFileModal noteName={this.props.note.name}
                       file={files[0]}
                       onCancel={this.hideModal}
                       onUpload={this.uploadFile} />
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
                       onDelete={this.deleteFile} />
    )
  }

  deleteFile = (file: IFileInfo) => {
    this.store.deleteFile(this.props.note.id, file).then(this.hideModal)
  }

  uploadFile = (name: string, file: File): Promise<void> => {
    return this.store.uploadFile(this.props.note.id, name, file).then(this.hideModal)
  }
}

export default NoteEditor
