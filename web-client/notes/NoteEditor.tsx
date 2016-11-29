import {observable, action, asReference} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import * as cx from 'classnames'

import * as config from 'web-client/config'
import {IFileInfo} from 'api-client/types'

import {Inject} from 'web-client/injector'
import Store from 'web-client/store'
import {Note as NoteEntity} from 'web-client/types'

import { Button, confirmationModal } from 'web-client/common'
import FilePicker from './FilePicker'
import AttachmentEditor from './AttachmentEditor'

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
          <Button onClick={this.onClickSave}>Save</Button>
          <Button type="dangerous" onClick={this.onClickDelete}>Delete</Button>
          <Button type="secondary" onClick={this.onClickCloseEditor}>Close editor</Button>
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

    this.store.updateNote(this.props.note.id, name, data).then(this.maybeCloseEditor)
  }

  onClickDelete = () => {
    const { note } = this.props
    const modalConfig = {
      title: 'Delete note',
      body: (<span>Do you really want to delete note <b>{note.name}</b></span>),
      onCancel: this.hideModal,
      onAction: () => this.store.deleteNote(note.id),
      actionBtnText: 'Delete',
    }
    this.changeModal(confirmationModal(modalConfig))
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

    const modalConfig = {
      title: 'Close editor',
      body: (
        <span>
          There are unsaved changes in <b>{note.name}</b>. <br />
          Do you really want to close editor?
        </span>
      ),
      onCancel: this.hideModal,
      onAction: this.closeEditor,
      actionBtnText: 'Close',
    }
    this.changeModal(confirmationModal(modalConfig))
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
    const modalConfig = {
      title: 'Delete file',
      body: (<span>Do you really want to delete file <b>{file.name}</b></span>),
      onCancel: this.hideModal,
      onAction: () => this.store.deleteFile(this.props.note.id, file).then(this.hideModal),
      actionBtnText: 'Delete',
    }
    this.changeModal(confirmationModal(modalConfig))
  }

  uploadFile = (name: string, file: File): Promise<void> => {
    return this.store.uploadFile(this.props.note.id, name, file).then(this.hideModal)
  }
}

export default NoteEditor
