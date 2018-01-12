import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createLink, createImageLink, extractFileIds, parse } from 'shared/parser'
import { readFile, sha256 } from 'client/utils'
import { Button, Textarea, Toolbar, FormInput, IconButton } from 'client/components'
import * as routerActions from 'client/router/actions'
import * as chromeActions from 'client/chrome/actions'
import * as notesActions from './actions'
import AttachFileButton from './AttachFileButton'
import DeleteNoteButton from './DeleteNoteButton'
import Note, { Title } from './Note'

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
    preview: false,
    name: this.props.name,
    data: this.props.data,
  }

  localFiles = {}

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
    return Object.entries(this.localFiles).filter(([ id ]) => ids.includes(id)).map(([ , file ]) => file)
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

      if (!this.localFiles[hash]) {
        this.localFiles = {
          ...this.localFiles,
          [hash]: { name: file.name, data, file },
        }
      }
    }))

    this.props.showLocker(false)

    this.textAreaRef.insert(links.join(' '))
    this.textAreaRef.focus()
  }

  render() {
    const { preview, name, data } = this.state
    const { id } = this.props

    const leftIcons = [
      id && <DeleteNoteButton key="delete" id={id} />,
      <AttachFileButton key="attach" onSelected={this.onFilesSelected} />,
      <IconButton key="preview" title="Preview" type={preview ? 'eye-off' : 'eye'} onClick={() => this.setState({ preview: !preview })} />,
    ]

    const isValid = name && this.hasChanges()
    const rightIcons = [
      <Button key="cancel" onClick={() => this.closeEditor(id)}>Cancel</Button>,
      id
        ? <Button key="save" primary onClick={this.onSave} disabled={!isValid}>Save</Button>
        : <Button key="create" primary onClick={this.onCreate} disabled={!isValid}>Create</Button>,
    ]

    return (
      <div className="view-container">
        <Toolbar left={leftIcons} right={rightIcons} />

        <div className="section" hidden={preview}>
          <FormInput className={Title} name="name" value={name} onChange={this.onNameChange} autoFocus />
        </div>

        <div className="section" hidden={preview}>
          <Textarea name="data" value={data} onChange={this.onDataChange} ref={(ref) => { this.textAreaRef = ref }} />
        </div>

        {preview && <Note name={name} data={data} localFiles={this.localFiles} />}
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
  showLocker: chromeActions.showLocker,
  push: routerActions.push,
}

export default connect(mapStateToProps, mapDispatchToProps)(NoteEditorView)
