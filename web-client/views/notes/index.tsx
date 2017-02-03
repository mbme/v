import * as React from 'react'
import {observable, action, computed} from 'mobx'
import {observer} from 'mobx-react'

import {config, fuzzySearch} from 'web-client/utils'
import { notesStore } from 'web-client/store'
import { IRecord } from 'api-client/types'

import { Button, Header, WithModals } from 'web-client/components'

import RecordsFilter from './RecordsFilter'
import NoteRecordView from './NoteRecord'
import NoteView from './Note'
import NoteEditorView from './NoteEditor'
import AddNoteModal from './AddNoteModal'

@observer
export default class NotesView extends WithModals<{}, {}> {
  @observable filter: string = ''

  @action updateFilter = (filter: string) => {
    this.filter = filter
  }

  @computed get visibleRecords(): IRecord[] {
    return notesStore.noteRecords.filter(record => {
      let filter = this.filter
      let name = record.name

      if (config.searchIgnoreCase) {
        filter = filter.toLowerCase()
        name = name.toLowerCase()
      }

      if (config.searchIgnoreSpaces) {
        filter = filter.replace(/\s/g, '') // remove spaces from the string
      }

      return fuzzySearch(filter, name)
    })
  }

  componentWillMount(): void {
    notesStore.loadNoteRecords()
  }

  renderRecordsCount(): string {
    const recordsCount = notesStore.noteRecords.length
    const visibleRecordsCount = this.visibleRecords.length

    if (!recordsCount) {
      return 'no notes :('
    }

    if (visibleRecordsCount < recordsCount) {
      return `${visibleRecordsCount} out of ${recordsCount} notes`
    }

    return `${recordsCount} notes`
  }

  showModal = () => {
    this.setModal(
        <AddNoteModal onClose={this.hideModal} />
    )
  }

  render (): JSX.Element {
    const records = notesStore.noteRecords.map(
      record => <NoteRecordView
                    key={record.id}
                    record={record}
                    isOpen={notesStore.noteId === record.id}
                    isVisible={this.visibleRecords.indexOf(record) > -1}
                    onClick={notesStore.openNote} />
    )

    const { note } = notesStore
    let noteView

    if (note) {
      if (notesStore.edit) {
        noteView = <NoteEditorView key={note.id} note={note} />
      } else {
        noteView = <NoteView key={note.id}
                             note={note}
                             onEdit={() => notesStore.editNote(note.id)}
                             onClose={() => notesStore.closeNote(note.id)} />
      }
    }

    return (
      <div className="NotesView">

        <Header>
          <Button onClick={this.showModal}>Add Note</Button>
        </Header>

        <div className="NotesView-left">
          <RecordsFilter initialValue={this.filter} onChange={this.updateFilter} />

          <div className="NotesView-recordsCount">{this.renderRecordsCount()}</div>

          <ul className="NotesView-list">
            {records}
          </ul>
        </div>

        <div className="NotesView-center">
          {noteView}
        </div>
      </div>
    )
  }
}
