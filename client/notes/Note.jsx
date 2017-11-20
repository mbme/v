import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { parse, types, removeLinkPrefixes } from 'shared/parser'
import s from 'client/styles'
import { Link, Toolbar, IconButton } from 'client/components'
import DeleteNoteButton from './DeleteNoteButton'

function renderParagraph(items) {
  return items.map((item) => {
    if (types.isImage(item)) {
      const id = removeLinkPrefixes(item.items[0].items[0])
      const url = `/api?fileId=${id}`
      return (
        <img alt={item.items[1].items[0]} src={url} />
      )
    }

    if (types.isLink(item)) {
      return (
        <a href={item.items[0].items[0]}>{item.items[1].items[0]}</a>
      )
    }

    if (types.isMono(item)) {
      return (
        <code>{item.items[0]}</code>
      )
    }

    if (types.isBold(item)) {
      return (
        <strong>{item.items[0]}</strong>
      )
    }

    return item
  })
}

function renderMarkup(data) {
  return parse(data).items.map((item) => {
    if (types.isHeader(item)) {
      return (
        <h1>{item.items}</h1>
      )
    }

    if (types.isParagraph(item)) {
      return (
        <p>{renderParagraph(item.items)}</p>
      )
    }

    return item
  })
}

function NoteView({ note }) {
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
        {renderMarkup(note.data)}
      </div>
    </div>
  )
}
NoteView.propTypes = {
  note: PropTypes.object.isRequired,
}

const mapStateToProps = ({ notes }, { id }) => ({
  note: notes.notes.find(note => note.id === id),
})

export default connect(mapStateToProps)(NoteView)
