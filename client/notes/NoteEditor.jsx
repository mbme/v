import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ViewContainer, Textarea, Toolbar, LinkButton, Input, Section } from 'client/components'

export default class NoteEditorView extends Component {
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

  onCanel = () => {
    console.error('CANCEL')
  }

  onDelete = () => {
    console.error('DELETE')
  }

  render() {
    const { name, data } = this.state

    return (
      <ViewContainer>
        <Toolbar>
          <LinkButton onClick={this.onSave}>SAVE</LinkButton>
          <LinkButton onClick={this.onDelete}>DELETE</LinkButton>
          <LinkButton onClick={this.onCanel}>CANCEL</LinkButton>
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
