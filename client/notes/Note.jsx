import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { parse } from 'shared/parser'
import s from 'client/styles'
import { Link, Toolbar, IconButton } from 'client/components'
import DeleteNoteButton from './DeleteNoteButton'

function renderItem(item, apiClient) {
  switch (item.type) {
    case 'Document':
      return item.items.map(childItem => renderItem(childItem, apiClient))

    case 'Header':
      return (
        <h1>{item.text}</h1>
      )

    case 'Paragraph':
      return (
        <p>{item.items.map(childItem => renderItem(childItem, apiClient))}</p>
      )

    case 'Mono':
      return (
        <code>{item.text}</code>
      )

    case 'Bold':
      return (
        <strong>{item.text}</strong>
      )

    case 'Link': {
      const url = item.link.isInternal ? apiClient.getFileUrl(item.link.address) : item.link.address

      if (item.link.type === 'image') {
        return (
          <img alt={item.link.name} src={url} />
        )
      }

      return (
        <a href={url}>{item.link.name}</a>
      )
    }

    default:
      return item
  }
}

class NoteView extends PureComponent {
  static propTypes = {
    note: PropTypes.object.isRequired,
  }

  static contextTypes = {
    apiClient: PropTypes.object.isRequired,
  }

  render() {
    const { note } = this.props

    const deleteBtn = (
      <DeleteNoteButton key="delete" id={note.id} />
    )

    const editBtn = (
      <Link to={{ name: 'note-editor', params: { id: note.id } }}>
        <IconButton type="edit-2" />
      </Link>
    )

    return (
      <div className={s.ViewContainer}>
        <Toolbar left={deleteBtn} right={editBtn} />
        <div className={s.Paper}>
          <div className={s.Heading}>{note.name}</div>
          {renderItem(parse(note.data), this.context.apiClient)}
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.notes.find(note => note.id === id),
})

export default connect(mapStateToProps)(NoteView)
