import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createFileLink } from 'shared/parser'
import { readFile, sha256 } from 'client/utils'
import { Button, Textarea, Toolbar, Input } from 'client/components'
import s from 'client/styles'
import * as routerActions from 'client/router/actions'
import * as notesActions from './actions'
import AttachFileButton from './AttachFileButton'
import DeleteNoteButton from './DeleteNoteButton'

class NoteEditorView extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    push: PropTypes.func.isRequired,
    createNote: PropTypes.func.isRequired,
    updateNote: PropTypes.func.isRequired,
  }

  state = {
    name: this.props.name,
    data: this.props.data,
  }

  textAreaRef = null

  hasChanges = () => this.state.name !== this.props.name || this.state.data !== this.props.data
  onNameChange = name => this.setState({ name })
  onDataChange = data => this.setState({ data })

  closeEditor = id => this.props.push(id ? { name: 'note', params: { id } } : { name: 'notes' })

  onSave = async () => {
    await this.props.updateNote(this.props.id, this.state.name, this.state.data)
    this.closeEditor(this.props.id)
  }

  onCreate = async () => {
    const id = await this.props.createNote(this.state.name, this.state.data)
    this.closeEditor(id)
  }

  onFilesSelected = async (files) => {
    if (!files.length) {
      return
    }

    const hashes = await Promise.all(files.map(file => readFile(file).then(sha256)))

    this.textAreaRef.insert(files.map((file, i) => createFileLink(file.name, hashes[i])).join(' '))
    this.textAreaRef.focus()
  }

  render() {
    const { name, data } = this.state
    const { id } = this.props

    const leftIcons = [
      id && <DeleteNoteButton key="delete" id={id} />,
      <AttachFileButton key="attach" onSelected={this.onFilesSelected} />,
    ]

    const rightIcons = [
      <Button key="cancel" onClick={() => this.closeEditor(id)}>Cancel</Button>,
      id
        ? <Button key="save" onClick={this.onSave} disabled={!this.hasChanges()}>Save</Button>
        : <Button key="create" onClick={this.onCreate} disabled={!this.hasChanges()}>Create</Button>,
    ]

    return (
      <div className={s.ViewContainer}>
        <Toolbar left={leftIcons} right={rightIcons} />

        <div className="section">
          <Input name="name" value={name} onChange={this.onNameChange} autoFocus />
        </div>

        <div className="section">
          <Textarea name="data" value={data} onChange={this.onDataChange} ref={(ref) => { this.textAreaRef = ref }} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ notes }, { id }) => {
  if (!id) {
    return { name: '', data: '' }
  }

  const note = notes.notes.find(n => n.id === id)
  return { name: note.name, data: note.data }
}

const mapDispatchToProps = {
  updateNote: notesActions.updateNote,
  createNote: notesActions.createNote,
  push: routerActions.push,
}

export default connect(mapStateToProps, mapDispatchToProps)(NoteEditorView)
