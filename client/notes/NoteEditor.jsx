import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ViewContainer, Textarea, Toolbar, FlatButton, Input, Section } from 'client/components'
import * as routerActions from 'client/router/actions'
import * as notesActions from './actions'
import DeleteNoteButton from './DeleteNoteButton'

class NoteEditorView extends PureComponent {
  static propTypes = {
    note: PropTypes.object.isRequired,
    updateNote: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      name: props.note.name,
      data: props.note.data,
    }
  }

  hasChanges = () => this.state.name !== this.props.note.name || this.state.data !== this.props.note.data

  onNameChange = e => this.setState({ name: e.target.value })
  onDataChange = e => this.setState({ data: e.target.value })

  onSave = () => this.props.updateNote(this.props.note.id, this.state.name, this.state.data).then(this.closeEditor)
  closeEditor = () => this.props.push('note', { id: this.props.note.id })

  render() {
    const { name, data } = this.state

    const leftIcons = [
      <DeleteNoteButton key="delete" id={this.props.note.id} />,
    ]

    const rightIcons = [
      <FlatButton key="cancel" onClick={this.closeEditor}>Cancel</FlatButton>,
      <FlatButton key="save" onClick={this.onSave} disabled={!this.hasChanges()}>Save</FlatButton>,
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

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.notes.find(note => note.id === id),
})

const mapDispatchToProps = {
  updateNote: notesActions.updateNote,
  push: routerActions.push,
}

export default connect(mapStateToProps, mapDispatchToProps)(NoteEditorView)
