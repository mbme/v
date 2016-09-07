import {action, observable, computed} from 'mobx'
import {http, fuzzySearch} from 'utils'
import * as config from 'config'

// type RecordType = 'note'

export type Id = number
export type Name = string
export type Data = string
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
    let name = this.name

    if (config.searchIgnoreCase) {
      filter = filter.toLowerCase()
      name = name.toLowerCase()
    }

    if (config.searchIgnoreSpaces) {
      filter = filter.replace(/\s/g, '') // remove spaces from the string
    }

    return fuzzySearch(filter, name)
  }
}

type FileName = string
type FileSize = number

interface IFileInfo {
  name: FileName,
  size: FileSize,
  create_ts: Timestamp,
}

export interface INoteDTO {
  id: Id,
  name: Name,
  create_ts: Timestamp,
  update_ts: Timestamp,
  data: Data,
  files: IFileInfo[],
}

export class Note {
  readonly id: Id
  readonly name: Name
  readonly createTs: Timestamp
  readonly updateTs: Timestamp
  readonly data: Data
  readonly files: IFileInfo[]

  @observable editMode: boolean

  constructor (dto: INoteDTO, editMode: boolean = false) {
    this.id = dto.id
    this.name = dto.name
    this.createTs = dto.create_ts
    this.updateTs = dto.update_ts
    this.data = dto.data
    this.files = dto.files

    this.editMode = editMode
  }

  @action
  edit(edit: boolean): void {
    this.editMode = edit
  }
}

export default class NotesStore {
  @observable records: NoteRecord[] = []
  @observable recordsFilter: string = ''
  @observable openNotes: Note[] = []

  @action
  loadRecordsList(): void {
    http.GET('/api/records').then((data: INoteRecordDTO[]) => {
      this.setRecordsList(data.map(dto => new NoteRecord(this, dto)))
    })
  }

  @action
  openNote(id: Id): void {
    if (this.isOpen(id)) {
      return
    }

    http.GET(`/api/notes/${id}`).then((data: INoteDTO) => {
      this.addOpenNote(new Note(data))
    })
  }

  @action
  closeNote(id: Id): void {
    const pos = this.indexOfNote(id)

    if (pos > -1) {
      this.openNotes.splice(pos, 1)
    }
  }

  @action
  createNote(name: Name): Promise<void> {
    const body = JSON.stringify({ name, 'data': '' })

    return http.POST(`/api/notes`, body).then((data: INoteDTO) => {
      this.addOpenNote(new Note(data, true))
      this.loadRecordsList()
    })
  }

  @action
  updateNote(id: Id, name: Name, data: Data): Promise<void> {
    const body = JSON.stringify({id, name, data})

    return http.PUT(`/api/notes/${id}`, body)
      .then((note: INoteDTO) => {
        this.replaceOpenNote(new Note(note))
        this.loadRecordsList()
      })
  }

  @action
  deleteNote(id: Id): Promise<void> {
    return http.DELETE(`/api/notes/${id}`).then(() => {
      this.closeNote(id)
      this.loadRecordsList()
    })
  }

  @action
  setRecordsFilter(filter: string): void {
    this.recordsFilter = filter
  }

  isOpen(id: Id): boolean {
    return this.indexOfNote(id) > -1
  }

  @action
  private setRecordsList(records: NoteRecord[]): void {
    this.records = records
  }

  @action
  private addOpenNote(note: Note): void {
    this.openNotes.unshift(note)
  }

  @action
  private replaceOpenNote(note: Note): void {
    const pos = this.indexOfNote(note.id)
    if (pos > -1) {
      this.openNotes.splice(pos, 1, note)
    }
  }

  private indexOfNote(id: Id): number {
    return this.openNotes.findIndex(note => note.id === id)
  }
}
