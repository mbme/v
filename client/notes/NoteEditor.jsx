import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { ViewContainer, Textarea, Toolbar, IconButton, FlatButton, Input, Link, Section } from 'client/components'

export default class NoteEditorView extends PureComponent {
  static propTypes = {
    note: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
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

  hasChanges() {
    return this.state.name !== this.props.note.name || this.state.data !== this.props.note.data
  }

  onSave = () => {
    this.props.onSave(this.props.note.id, this.state.name, this.state.data)
  }

  onDelete = () => {
    this.props.onDelete(this.props.note.id)
  }

  render() {
    const { name, data } = this.state

    const leftIcons = [
      <IconButton key="delete" type="trash-2" onClick={this.onDelete} />,
    ]

    const rightIcons = [
      <Link key="cancel" to={{ name: 'note', params: { id: this.props.note.id } }}>
        <FlatButton>Cancel</FlatButton>
      </Link>,
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
      </ViewContainer>
    )
  }
}
