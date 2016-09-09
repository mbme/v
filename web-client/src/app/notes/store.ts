import {action, observable, computed} from 'mobx'
import {http, fuzzySearch} from 'utils'
import * as config from 'config'

// type RecordType = 'note'

export type Id = number
export type Name = string
export type Data = string
type Timestamp = number

interface INoteRecordDTO {
  readonly id: Id,
  readonly name: Name,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
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

export type FileName = string
type FileSize = number

export interface IFileInfo {
  readonly name: FileName,
  readonly size: FileSize,
  readonly create_ts: Timestamp,
}

export interface INoteDTO {
  readonly id: Id,
  readonly name: Name,
  readonly create_ts: Timestamp,
  readonly update_ts: Timestamp,
  readonly data: Data,
  readonly files: ReadonlyArray<IFileInfo>,
}

export class Note {
  readonly id: Id
  readonly name: Name
  readonly createTs: Timestamp
  readonly updateTs: Timestamp
  readonly data: Data
  files: ReadonlyArray<IFileInfo>

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
        this.loadRecordsList()

        const oldNote = this.getOpenNote(id)
        if (oldNote) {
          this.replaceOpenNote(new Note(note, oldNote.editMode))
        }
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
  uploadFile(noteId: Id, name: FileName, file: File): Promise<void> {
    const data = new FormData()
    data.append('name', name)
    data.append('data', file)

    return http.POST(`/api/notes/${noteId}/files`, data)
      .then(() => this.loadNoteFiles(noteId))
      .then((files: IFileInfo[]) => {
        this.replaceNoteFiles(noteId, files)
      })
  }

  @action
  setRecordsFilter(filter: string): void {
    this.recordsFilter = filter
  }

  isOpen(id: Id): boolean {
    return this.indexOfNote(id) > -1
  }

  private loadNoteFiles(noteId: Id): Promise<IFileInfo[]> {
    return http.GET(`/api/notes/${noteId}/files`)
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
  private replaceNoteFiles(id: Id, files: IFileInfo[]): void {
    const pos = this.indexOfNote(id)
    if (pos === -1) {
      return
    }

    const note = this.openNotes[pos]

    note.files = files
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

  private getOpenNote(id: Id): Note | undefined {
    const pos = this.indexOfNote(id)
    if (pos > -1) {
      return this.openNotes[pos]
    }
  }
}
