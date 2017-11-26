import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createLink, createImageLink, extractFileIds, parse } from 'shared/parser'
import { readFile, sha256 } from 'client/utils'
import { Button, Textarea, Toolbar, Input } from 'client/components'
import s from 'client/styles'
import * as routerActions from 'client/router/actions'
import { showLocker } from 'client/chrome/actions'
import * as notesActions from './actions'
import AttachFileButton from './AttachFileButton'
import DeleteNoteButton from './DeleteNoteButton'

const isImage = name => [ '.png', '.jpg', '.jpeg' ].reduce((acc, ext) => acc || name.endsWith(ext), false)

class NoteEditorView extends PureComponent {
  static propTypes = {
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    push: PropTypes.func.isRequired,
    createNote: PropTypes.func.isRequired,
    updateNote: PropTypes.func.isRequired,
    showLocker: PropTypes.func.isRequired,
  }

  state = {
    name: this.props.name,
    data: this.props.data,
  }

  files = {}

  textAreaRef = null

  hasChanges = () => this.state.name !== this.props.name || this.state.data !== this.props.data
  onNameChange = name => this.setState({ name })
  onDataChange = data => this.setState({ data })

  closeEditor = id => this.props.push(id ? { name: 'note', params: { id } } : { name: 'notes' })

  onSave = async () => {
    await this.props.updateNote(this.props.id, this.state.name, this.state.data, this.getAttachments())
    this.closeEditor(this.props.id)
  }

  onCreate = async () => {
    const id = await this.props.createNote(this.state.name, this.state.data, this.getAttachments())
    this.closeEditor(id)
  }

  getAttachments() {
    const ids = extractFileIds(parse(this.state.data))
    // TODO filter out known files
    return Object.entries(this.files).filter(([ id ]) => ids.includes(id)).map(([ , file ]) => file)
  }

  onFilesSelected = async (files) => {
    if (!files.length) {
      return
    }

    this.props.showLocker(true)

    const links = []
    await Promise.all(files.map(async (file) => {
      const data = await readFile(file)
      const hash = await sha256(data)

      links.push((isImage(file.name) ? createImageLink : createLink)(file.name, hash))

      this.files[hash] = { name: file.name, data }
    }))

    this.props.showLocker(false)

    this.textAreaRef.insert(links.join(' '))
    this.textAreaRef.focus()
  }

  render() {
    const { name, data } = this.state
    const { id } = this.props

    const leftIcons = [
      id && <DeleteNoteButton key="delete" id={id} />,
      <AttachFileButton key="attach" onSelected={this.onFilesSelected} />,
    ]

    const isValid = name && this.hasChanges()
    const rightIcons = [
      <Button key="cancel" onClick={() => this.closeEditor(id)}>Cancel</Button>,
      id
        ? <Button key="save" onClick={this.onSave} disabled={!isValid}>Save</Button>
        : <Button key="create" onClick={this.onCreate} disabled={!isValid}>Create</Button>,
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
  showLocker,
}

export default connect(mapStateToProps, mapDispatchToProps)(NoteEditorView)
