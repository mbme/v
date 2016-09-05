import {action, observable, computed} from 'mobx'
import {simpleFetch, fuzzySearch} from 'utils'
import * as config from 'config'

// type RecordType = 'note'

export type Id = number
type Name = string
type Timestamp = number

interface INoteRecordDTO {
  id: Id,
  name: Name,
  create_ts: Timestamp,
  update_ts: Timestamp,
}

export class NoteRecord {
  readonly id: Id
  readonly name: Name
  readonly createTs: Timestamp
  readonly updateTs: Timestamp

  private store: NotesStore

  constructor(store: NotesStore, dto: INoteRecordDTO) {
    this.store = store

    this.id = dto.id
    this.name = dto.name
    this.createTs = dto.create_ts
    this.updateTs = dto.update_ts
  }

  @computed get isOpen(): boolean {
    return this.store.isOpen(this.id)
  }

  @computed get isVisible(): boolean {
    let filter = this.store.recordsFilter

    if (config.searchIgnoreCase) {
      filter = filter.toLowerCase()
    }

    if (config.searchIgnoreSpaces) {
      filter = filter.replace(/\s/g, '') // remove spaces from the string
    }

    return fuzzySearch(filter, this.name)
  }
}

type FileName = string
type FileSize = number

interface IFileInfo {
  name: FileName,
  size: FileSize,
  create_ts: Timestamp,
}

export interface INote {
  id: Id,
  name: Name,
  create_ts: Timestamp,
  update_ts: Timestamp,
  data: string,
  files: IFileInfo[],
}

export default class NotesStore {
  @observable records: NoteRecord[] = []
  @observable recordsFilter: string = ''
  @observable openNotes: INote[] = []

  @action
  loadRecordsList(): void {
    simpleFetch('/api/records').then((data: INoteRecordDTO[]) => {
      this.setRecordsList(data.map(dto => new NoteRecord(this, dto)))
    })
  }

  @action
  openNote(id: Id): void {
    if (this.isOpen(id)) {
      return
    }

    simpleFetch(`/api/notes/${id}`).then((data: INote) => {
      this.addOpenNote(data)
    })
  }

  @action
  setRecordsFilter(filter: string): void {
    this.recordsFilter = filter
  }

  isOpen(id: Id): boolean {
    return this.openNotes.filter(n => n.id === id).length === 1
  }

  @action
  private setRecordsList(records: NoteRecord[]): void {
    this.records = records
  }

  @action
  private addOpenNote(note: INote): void {
    this.openNotes.unshift(note)
  }

}
