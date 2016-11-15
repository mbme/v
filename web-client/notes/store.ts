import {action, observable, computed} from 'mobx'
import {fuzzySearch} from 'web-client/utils'
import * as config from 'web-client/config'
import {Id, Timestamp, FileName, IFileInfo} from 'api-client/types'
import { IRecord, INote } from 'api-client/types'
import * as api from 'api-client'

export class NoteRecord {
  readonly id: Id
  readonly name: string
  readonly createTs: Timestamp
  readonly updateTs: Timestamp

  private store: NotesStore

  constructor(store: NotesStore, dto: IRecord) {
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

export class Note {
  readonly id: Id
  readonly name: string
  readonly createTs: Timestamp
  readonly updateTs: Timestamp
  readonly data: string
  files: ReadonlyArray<IFileInfo>

  @observable editMode: boolean

  constructor (dto: INote, editMode: boolean = false) {
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
  loadRecordsList(): Promise<void> {
    return api.listNotes().then((data: IRecord[]) => {
      this.setRecordsList(data.map(dto => new NoteRecord(this, dto)))
    })
  }

  @action
  openNote(id: Id): Promise<void> {
    if (this.isOpen(id)) {
      return Promise.resolve()
    }

    return api.readNote(id).then((data: INote) => {
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
  createNote(name: string): Promise<void> {
    return api.createNote(name).then((data: INote) => {
      this.addOpenNote(new Note(data, true))
      this.loadRecordsList()
    })
  }

  @action
  updateNote(id: Id, name: string, data: string): Promise<void> {
    return api.updateNote(id, name, data)
      .then((note: INote) => {
        this.loadRecordsList()

        const oldNote = this.getOpenNote(id)
        if (oldNote) {
          this.replaceOpenNote(new Note(note, oldNote.editMode))
        }
      })
  }

  @action
  deleteNote(id: Id): Promise<void> {
    return api.deleteNote(id).then(() => {
      this.closeNote(id)
      this.loadRecordsList()
    })
  }

  @action
  uploadFile(recordId: Id, name: FileName, file: File): Promise<void> {
    return api.uploadFile(recordId, name, file)
      .then(() => this.loadFiles(recordId))
      .then((files: IFileInfo[]) => {
        this.replaceNoteFiles(recordId, files)
      })
  }

  @action
  deleteFile(recordId: Id, file: IFileInfo): Promise<void> {
    return api.deleteFile(recordId, file.name)
      .then(() => this.loadFiles(recordId))
      .then((files: IFileInfo[]) => {
        this.replaceNoteFiles(recordId, files)
      })
  }

  @action
  setRecordsFilter(filter: string): void {
    this.recordsFilter = filter
  }

  isOpen(id: Id): boolean {
    return this.indexOfNote(id) > -1
  }

  private loadFiles(noteId: Id): Promise<IFileInfo[]> {
    return api.listFiles(noteId)
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