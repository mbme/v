import {observable, action} from 'mobx'
import {observer} from 'mobx-react'
import * as React from 'react'
import {Note as NoteEntity, Name, Data} from './store'
import LinkButton from 'common/LinkButton'
import DeleteNoteModal from './DeleteNoteModal'

interface IProps {
  note: NoteEntity,
  onDelete: () => void,
  onSave: (name: Name, data: Data) => void,
  onCancel: () => void,
}

@observer
class NoteEditor extends React.Component<IProps, {}> {
  @observable showDeleteNoteModal: boolean = false

  @action showModal(show: boolean): void {
    this.showDeleteNoteModal = show
  }

  render (): JSX.Element {
    const { note } = this.props
    return (
      <div className="NoteEditor">
        <div className="NoteEditor-toolbar">
          <LinkButton onClick={this.onClickSave}>Save</LinkButton>
          <LinkButton type="dangerous" onClick={this.onClickDelete}>Delete</LinkButton>
          <LinkButton type="secondary" onClick={this.onClickCancel}>Cancel</LinkButton>

          <DeleteNoteModal isVisible={this.showDeleteNoteModal}
                           name={note.name}
                           onCancel={this.onCancelDelete}
                           onDelete={this.props.onDelete} />
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
      </div>
    )
  }

  onClickSave = () => {
    const name = (this.refs['name'] as HTMLInputElement).value
    const data = (this.refs['data'] as HTMLTextAreaElement).value

    this.props.onSave(name, data)
  }

  onClickDelete = () => {
    this.showModal(true)
  }

  onCancelDelete = () => {
    this.showModal(false)
  }

  onClickCancel = () => {
    this.props.onCancel()
  }
}

export default NoteEditor
