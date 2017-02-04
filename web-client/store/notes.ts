import { observable } from 'mobx'

import UIStore from './ui'

import * as api from 'api-client'
import { IRecord, INote } from 'api-client/types'

export default class NotesStore {
  @observable noteRecords: IRecord[] = []
  @observable note?: INote
  @observable noteId?: number
  @observable edit: boolean = false

  constructor(private uiStore: UIStore) {}

  async loadNoteRecords(): Promise<void> {
    const data = await this.uiStore.errorHandler(api.listNotes(), 'failed to load notes list')

    this.noteRecords = data
  }

  openNote = async (id: number): Promise<void> => {
    this.noteId = id
    this.edit = false

    const data = await this.uiStore.errorHandler(api.readNote(id), `failed to read note ${id}`)
    this.note = data
  }

  editNote(id: number, edit: boolean = true): void {
    if (this.noteId === id) {
      this.edit = edit
    }
  }

  closeNote(id: number): void {
    if (this.noteId !== id)  {
      return
    }

    this.note = undefined
    this.edit = false
    this.noteId = undefined
  }

  async createNote(name: string): Promise<void> {
    const data = await this.uiStore.errorHandler(api.createNote(name), 'failed to create note')

    this.note = data
    this.noteId = data.id
    this.edit = true

    this.loadNoteRecords()
  }

  async updateNote(id: number, name: string, data: string): Promise<void> {
    const note = await this.uiStore.errorHandler(
      api.updateNote(id, name, data),
      `failed to update note ${id}`
    )

    this.loadNoteRecords()

    if (this.noteId === id) {
      this.note = note
    }
  }

  async deleteNote(id: number): Promise<void> {
    await this.uiStore.errorHandler(api.deleteNote(id), `failed to delete note ${id}`)

    this.loadNoteRecords()
    this.closeNote(id)
  }
}
