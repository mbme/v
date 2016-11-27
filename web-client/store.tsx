import {
  action,
  observable,
  /* computed,*/
} from 'mobx'

import * as api from 'api-client'

import {
  Timestamp,
  IRecord,
  INote,
  IFileInfo,
} from 'api-client/types'

export class ProjectRecord {
  readonly id: number
  readonly name: string
  readonly createTs: Timestamp
  readonly updateTs: Timestamp

  constructor(dto: IRecord) {
    this.id = dto.id
    this.name = dto.name
    this.createTs = dto.create_ts
    this.updateTs = dto.update_ts
  }
}

export class NoteRecord {
  readonly id: number
  readonly name: string
  readonly createTs: Timestamp
  readonly updateTs: Timestamp

  constructor(dto: IRecord) {
    this.id = dto.id
    this.name = dto.name
    this.createTs = dto.create_ts
    this.updateTs = dto.update_ts
  }
}

export class Note {
  readonly id: number
  readonly name: string
  readonly createTs: Timestamp
  readonly updateTs: Timestamp
  readonly data: string
  files: ReadonlyArray<IFileInfo>

  constructor (dto: INote) {
    this.id = dto.id
    this.name = dto.name
    this.createTs = dto.create_ts
    this.updateTs = dto.update_ts
    this.data = dto.data
    this.files = dto.files
  }
}

export class Store {
  @observable projectRecords: ProjectRecord[] = []
  @observable noteRecords: NoteRecord[] = []
  @observable openNotes: Note[] = []

  @action
  async loadProjectsList(): Promise<void> {
    const data = await this.errorHandler(api.listProjects(), 'failed to load projects list')
    this.setProjectRecords(data.map(dto => new ProjectRecord(dto)))
  }

  @action
  async loadNoteRecords(): Promise<void> {
    const data = await this.errorHandler(api.listNotes(), 'failed to load notes list')
    this.setNoteRecords(data.map(dto => new NoteRecord(dto)))
  }

  @action
  async openNote(id: number): Promise<void> {
    if (this.indexOfNote(id) > -1) { // already open
      return
    }

    const data = await this.errorHandler(api.readNote(id), `failed to read note ${id}`)
    this.addOpenNote(new Note(data))
  }

  @action
  closeNote(id: number): void {
    const pos = this.indexOfNote(id)

    if (pos > -1) {
      this.openNotes.splice(pos, 1)
    }
  }

  @action
  async createNote(name: string): Promise<void> {
    const data = await this.errorHandler(api.createNote(name), 'failed to create note')

    this.addOpenNote(new Note(data))
    this.loadNoteRecords()
  }

  @action
  async updateNote(id: number, name: string, data: string): Promise<void> {
    const note = await this.errorHandler(
      api.updateNote(id, name, data),
      `failed to update note ${id}`
    )

    const pos = this.indexOfNote(id)
    if (pos > -1) { // replace if note is open
      this.replaceOpenNote(new Note(note))
    }

    this.loadNoteRecords()
  }

  @action
  async deleteNote(id: number): Promise<void> {
    await this.errorHandler(api.deleteNote(id), `failed to delete note ${id}`)

    this.closeNote(id)
    this.loadNoteRecords()
  }

  @action
  async uploadFile(recordId: number, name: string, file: File): Promise<void> {
    await this.errorHandler(
      api.uploadFile(recordId, name, file),
      `failed to upload file for record ${recordId}`
    )

    const files = await this.errorHandler(
      api.listFiles(recordId),
      `failed to list files of record ${recordId}`
    )
    this.replaceNoteFiles(recordId, files)
  }

  @action
  async deleteFile(recordId: number, file: IFileInfo): Promise<void> {
    await this.errorHandler(
      api.deleteFile(recordId, file.name),
      `failed to delete file of record ${recordId}`
    )

    const files = await this.errorHandler(
      api.listFiles(recordId),
      `failed to list files of record ${recordId}`
    )
    this.replaceNoteFiles(recordId, files)
  }

  @action
  private setNoteRecords(records: NoteRecord[]): void {
    this.noteRecords.splice(0, this.noteRecords.length, ...records)
  }

  @action
  private addOpenNote(note: Note): void {
    this.openNotes.push(note)
  }

  @action
  private replaceNoteFiles(id: number, files: IFileInfo[]): void {
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

  private indexOfNote(id: number): number {
    return this.openNotes.findIndex(note => note.id === id)
  }

  @action
  private setProjectRecords(projects: ProjectRecord[]): void {
    this.projectRecords = projects
  }

  private errorHandler<T>(promise: Promise<T>, errorMsg: string): Promise<T> {
    return promise.catch(e => {
      console.error(errorMsg, e)
      throw e
    })
  }

}
