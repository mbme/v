import * as React from 'react'
import {observable, action, computed} from 'mobx'
import {observer} from 'mobx-react'

import {config, fuzzySearch, Inject} from 'web-client/utils' // FIXME join
import Store from 'web-client/store' // FIXME join
import { NoteRecord } from 'web-client/utils/types'

import { Button, Header } from 'web-client/components'

import RecordsFilter from './RecordsFilter'
import NoteRecordsList from './NoteRecordsList'
import NotesList from './NotesList'
import AddNoteModal from './AddNoteModal'

@observer
export default class NotesView extends React.Component<{}, {}> {
  @Inject store: Store

  @observable showModal: boolean = false
  @observable filter: string = ''

  componentWillMount(): void {
    this.store.loadNotesList()
  }

  @action
  setShowModal(show: boolean): void {
    this.showModal = show
  }

  @action
  updateFilter = (filter: string) => {
    this.filter = filter
  }

  @computed get visibleRecords(): NoteRecord[] {
    return this.store.records.filter(record => {
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

  renderRecordsCount(): string {
    const recordsCount = this.store.records.length
    const visibleRecordsCount = this.visibleRecords.length

    if (!recordsCount) {
      return 'no records :('
    }

    if (visibleRecordsCount < recordsCount) {
      return `${visibleRecordsCount} out of ${recordsCount} records`
    }

    return `${recordsCount} records`
  }

  render (): JSX.Element {
    return (
      <div className="NotesView">
        <AddNoteModal show={this.showModal} onClose={() => this.setShowModal(false)} />

        <Header>
          <Button onClick={() => this.setShowModal(true)}>Add Note</Button>
        </Header>

        <div className="NotesView-left">
          <RecordsFilter initialValue={this.filter} onChange={this.updateFilter} />

          <div className="NotesView-recordsCount">{this.renderRecordsCount()}</div>

          <NoteRecordsList />
        </div>

        <div className="NotesView-center">
          <NotesList />
        </div>
      </div>
    )
  }
}
