import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { LoadingView, NotFoundView, ViewContainer, Textarea, Toolbar, IconButton, FlatButton, Input, Section, ConfirmationDialog } from 'client/components'
import * as routerActions from 'client/router/actions'
import * as notesActions from './actions'

class NoteEditorView extends PureComponent {
  static propTypes = {
    note: PropTypes.object.isRequired,
    updateNote: PropTypes.func.isRequired,
    deleteNote: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      name: props.note.name,
      data: props.note.data,
      showDeleteConfirmation: false,
    }
  }

  hasChanges = () => this.state.name !== this.props.note.name || this.state.data !== this.props.note.data

  onNameChange = e => this.setState({ name: e.target.value })
  onDataChange = e => this.setState({ data: e.target.value })

  onSave = () => this.props.updateNote(this.props.note.id, this.state.name, this.state.data).then(this.closeEditor)
  onDelete = () => this.setState({ showDeleteConfirmation: true })
  closeEditor = () => this.props.push('note', { id: this.props.note.id })

  deleteNote = () => this.props.deleteNote(this.props.note.id).then(() => this.props.push('notes'))

  renderDeleteConfirmation() {
    return (
      <ConfirmationDialog confirmation="Delete" onConfirmed={this.deleteNote} onCancel={() => this.setState({ showDeleteConfirmation: false })}>
        Are you sure you want to <b>delete this note?</b>
      </ConfirmationDialog>
    )
  }

  render() {
    const { name, data, showDeleteConfirmation } = this.state

    const leftIcons = [
      <IconButton key="delete" type="trash-2" onClick={this.onDelete} />,
    ]

    const rightIcons = [
      <FlatButton key="cancel" onClick={this.closeEditor}>Cancel</FlatButton>,
      <FlatButton key="save" onClick={this.onSave} disabled={!this.hasChanges()}>Save</FlatButton>,
    ]

    return (
      <ViewContainer>
        <Toolbar left={leftIcons} right={rightIcons} />

        <Section side="top">
          <Input name="name" type="text" value={name} onChange={this.onNameChange} />
        </Section>

        <Section>
          <Textarea name="data" value={data} onChange={this.onDataChange} />
        </Section>

        {showDeleteConfirmation && this.renderDeleteConfirmation()}
      </ViewContainer>
    )
  }
}

function Loader({ initialized, note, listNotes, ...props }) {
  if (!initialized) {
    listNotes()

    return <LoadingView />
  }

  if (!note) {
    return <NotFoundView />
  }

  return <NoteEditorView note={note} {...props} />
}
Loader.propTypes = {
  initialized: PropTypes.bool.isRequired,
  note: PropTypes.object,
  listNotes: PropTypes.func.isRequired,
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.notes.find(note => note.id === id),
  initialized: notes.initialized,
})

const mapDispatchToProps = {
  listNotes: notesActions.listNotes,
  updateNote: notesActions.updateNote,
  deleteNote: notesActions.deleteNote,
  push: routerActions.push,
}

export default connect(mapStateToProps, mapDispatchToProps)(Loader)
