import * as React from 'react'
import {observer} from 'mobx-react'

import { Note } from 'web-client/utils/types'

import NoteView from './Note'
import NoteEditor from './NoteEditor'

interface IProps {
  note?: Note,
}

@observer
class NotesList extends React.Component<IProps, {}> {
  render (): JSX.Element | null {
    const { note } = this.props

    if (!note) {
      return null
    }

    if (note.editMode) { // FIXME remove edit mode
      return <NoteEditor key={note.id} note={note} />
    } else {
      return <NoteView key={note.id} note={note} />
    }
  }
}

export default NotesList
