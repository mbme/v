import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { ViewContainer, Textarea, Toolbar, IconButton, FlatButton, Input, Section } from 'client/components'

export default class NoteEditorView extends PureComponent {
  static propTypes = {
    note: PropTypes.object.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
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

  onCancel = () => {
    this.context.router.back()
  }

  onDelete = () => {
    console.error('DELETE')
  }

  render() {
    const { name, data } = this.state

    const leftIcons = [
      <IconButton key="delete" type="trash-2" onClick={this.onDelete} />,
    ]

    const rightIcons = [
      <FlatButton key="cancel" onClick={this.onCancel}>Cancel</FlatButton>,
      <FlatButton key="save" onClick={this.onSave}>Save</FlatButton>,
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
