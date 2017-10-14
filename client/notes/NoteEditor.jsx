import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ViewContainer, Textarea, Toolbar, FlatButton, Input, Section } from 'client/components'
import * as routerActions from 'client/router/actions'
import * as notesActions from './actions'
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

  hasChanges = () => this.state.name !== this.props.name || this.state.data !== this.props.data
  onNameChange = e => this.setState({ name: e.target.value })
  onDataChange = e => this.setState({ data: e.target.value })

  closeEditor = id => this.props.push(id ? { name: 'note', params: { id } } : { name: 'notes' })

  onSave = async () => {
    await this.props.updateNote(this.props.id, this.state.name, this.state.data)
    this.closeEditor(this.props.id)
  }

  onCreate = async () => {
    const id = await this.props.createNote(this.state.name, this.state.data)
    this.closeEditor(id)
  }

  render() {
    const { name, data } = this.state
    const { id } = this.props

    const leftIcons = [
      id && <DeleteNoteButton key="delete" id={id} />,
    ]

    const rightIcons = [
      <FlatButton key="cancel" onClick={() => this.closeEditor(id)}>Cancel</FlatButton>,
      id
        ? <FlatButton key="save" onClick={this.onSave} disabled={!this.hasChanges()}>Save</FlatButton>
        : <FlatButton key="create" onClick={this.onCreate} disabled={!this.hasChanges()}>Create</FlatButton>,
    ]

    return (
      <ViewContainer>
        <Toolbar left={leftIcons} right={rightIcons} />

        <Section side="bottom">
          <Input name="name" type="text" value={name} onChange={this.onNameChange} autoFocus />
        </Section>

        <Section side="bottom">
          <Textarea name="data" value={data} onChange={this.onDataChange} />
        </Section>
      </ViewContainer>
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
