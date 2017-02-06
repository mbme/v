import {observer} from 'mobx-react'
import * as React from 'react'

import { config } from 'web-client/utils'
import { notesStore } from 'web-client/store'
import { INote } from 'api-client/types'

import { confirmationModal, WithModals } from 'web-client/components'
import Toolbar, { IAction } from './Toolbar'

interface IProps {
  note: INote,
}

@observer
export default class NoteEditor extends WithModals<IProps, {}> {

  render (): JSX.Element {
    const { note } = this.props

    const actions: IAction[] = [
      { label: 'Save', action: this.saveNote },
      { label: 'Delete', type: 'dangerous', action: this.deleteNote },
      { label: 'Close editor', type: 'secondary', action: this.onClickCloseEditor },
    ]

    return (
      <div className="NoteContainer">
        {this.modal}

        <div className="NoteEditor">
          <input className="NoteEditor-name"
                 ref="name"
                 type="text"
                 placeholder="Name"
                 defaultValue={note.name} />

          <textarea className="NoteEditor-data"
                    ref="data"
                    placeholder="Type something here"
                    defaultValue={note.data} />

        </div>

        <Toolbar recordId={note.id}
                 edit
                 actions={actions}
                 files={note.files}
                 reloadFiles={() => notesStore.loadNote(note.id)} />
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
    notesStore.editNote(this.props.note.id, false)
  }

  saveNote = () => {
    const name = this.getNameInputValue()
    const data = this.getDataTextareaValue()

    // do not save if there are no changes
    if (this.props.note.name === name && this.props.note.data === data) {
      this.maybeCloseEditor()
      return
    }

    notesStore.updateNote(this.props.note.id, name, data).then(this.maybeCloseEditor)
  }

  deleteNote = () => {
    const { note } = this.props
    const modalConfig = {
      title: 'Delete note',
      body: (<span>Do you really want to delete note <b>{note.name}</b></span>),
      onCancel: this.hideModal,
      onAction: () => notesStore.deleteNote(note.id),
      actionBtnText: 'Delete',
    }
    this.setModal(confirmationModal(modalConfig))
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
    this.setModal(confirmationModal(modalConfig))
  }
}
