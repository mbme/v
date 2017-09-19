import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { ViewContainer, Textarea, Toolbar, FlatButton, Input, Section } from 'client/components'

export default class NoteEditorView extends PureComponent {
  static propTypes = {
    note: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      name: props.note.name,
      data: props.note.data,
    }
  }

  onNameChange = e => this.setState({ name: e.target.value })
  onDataChange = e => this.setState({ data: e.target.value })

  onSave = () => {
    console.error('SAVE')
  }

  onClose = () => {
    console.error('CLOSE')
  }

  onDelete = () => {
    console.error('DELETE')
  }

  render() {
    const { name, data } = this.state

    return (
      <ViewContainer>
        <Toolbar>
          <FlatButton onClick={this.onSave}>Save</FlatButton>
          <FlatButton onClick={this.onDelete}>Delete</FlatButton>
          <FlatButton onClick={this.onClose}>Close</FlatButton>
        </Toolbar>

        <Section side="top">
          <Input name="name" type="text" value={name} onChange={this.onNameChange} />
        </Section>

        <Section>
          <Textarea name="data" value={data} onChange={this.onDataChange} />
        </Section>
      </ViewContainer>
    )
  }
}
