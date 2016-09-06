import {observer} from 'mobx-react'
import * as React from 'react'
import {Note as NoteEntity, Name, Data} from './store'
import LinkButton from 'common/LinkButton'

interface IProps {
  note: NoteEntity,
  onSave: (name: Name, data: Data) => void,
  onCancel: () => void,
}

@observer
class NoteEditor extends React.Component<IProps, {}> {
  render (): JSX.Element {
    const { note } = this.props
    return (
      <div className="NoteEditor">
        <div className="Toolbar">
          <LinkButton onClick={this.onClickSave}>Save</LinkButton>
          <LinkButton onClick={this.onClickCancel}>Cancel</LinkButton>
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

  onClickCancel = () => {
    this.props.onCancel()
  }
}

export default NoteEditor
