import {action, observable, computed} from 'mobx'

import * as api from 'api-client'
import {
  Id,
  IFileInfo,
} from 'api-client/types'
import {
  ProjectRecord,
  NoteRecord,
  Note,
  Modal,
  Toast,
  ToastType,
} from 'web-client/types'
import {fuzzySearch} from 'web-client/utils'
import * as config from 'web-client/config'

export default class Store {
  private static _counter: number = 0

  @observable projects: ProjectRecord[] = []

  @observable records: NoteRecord[] = []
  @observable recordsFilter: string = ''
  @observable openNotes: Note[] = []

  @observable modals: Modal[] = []
  @observable toasts: Toast[] = []

  @computed get visibleRecords(): NoteRecord[] {
    return this.records.filter(record => {
      let filter = this.recordsFilter
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

  @action
  async loadProjectsList(): Promise<void> {
    const data = await this.errorHandler(api.listProjects(), 'failed to load projects list')
    this.setProjectsList(data.map(dto => new ProjectRecord(dto)))
  }

  @action
  async loadNotesList(): Promise<void> {
    const data = await this.errorHandler(api.listNotes(), 'failed to load notes list')
    this.setRecordsList(data.map(dto => new NoteRecord(dto)))
  }

  @action
  async openNote(id: Id): Promise<void> {
    if (this.isNoteOpen(id)) {
      return
    }

    const data = await this.errorHandler(api.readNote(id), `failed to read note ${id}`)
    this.addOpenNote(new Note(data))
  }

  @action
  closeNote(id: Id): void {
    const pos = this.indexOfNote(id)

    if (pos > -1) {
      this.openNotes.splice(pos, 1)
    }
  }

  @action
  async createNote(name: string): Promise<void> {
    const data = await this.errorHandler(api.createNote(name), 'failed to create note')

    this.addOpenNote(new Note(data, true))
    this.loadNotesList()
  }

  @action
  async updateNote(id: Id, name: string, data: string): Promise<void> {
    const note = await this.errorHandler(
      api.updateNote(id, name, data),
      `failed to update note ${id}`
    )

    const oldNote = this.getOpenNote(id)
    if (oldNote) {
      this.replaceOpenNote(new Note(note, oldNote.editMode))
    }

    this.loadNotesList()
  }

  @action
  async deleteNote(id: Id): Promise<void> {
    await this.errorHandler(api.deleteNote(id), `failed to delete note ${id}`)

    this.closeNote(id)
    this.loadNotesList()
  }

  @action
  async uploadFile(recordId: Id, name: string, file: File): Promise<void> {
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
  async deleteFile(recordId: Id, file: IFileInfo): Promise<void> {
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
  setRecordsFilter(filter: string): void {
    this.recordsFilter = filter
  }

  isNoteOpen(id: Id): boolean {
    return this.indexOfNote(id) > -1
  }

  @computed get visibleModal(): Modal | undefined {
    if (this.modals.length > 0) {
      return this.modals[0]
    }
  }

  @action
  openModal(el: JSX.Element): number {
    const id = this.genId()
    this.modals.unshift(new Modal(id, el))

    return id
  }

  @action
  updateModal(id: number, el: JSX.Element): void {
    const pos = this.findModalPos(id)

    if (pos > -1) {
      this.modals.splice(pos, 1, new Modal(id, el))
    } else {
      throw new Error(`Can't find modal with id ${id}`)
    }
  }

  @action
  closeModal(id: number): void {
    const pos = this.findModalPos(id)
    if (pos > -1) {
      this.modals.splice(pos, 1)
    }
  }

  @action
  showToast(content: JSX.Element | string, type: ToastType = 'normal'): void {
    const id = this.genId()
    this.toasts.unshift(new Toast(id, type, content))

    setTimeout(() => this.hideToast(id), config.toastExpirationMs)
  }

  showErrorToast(msg: string, err: Error): void {
    this.showToast(`${msg}: ${err.toString()}`, 'error')
  }

  @action
  private hideToast(id: number): void {
    const pos = this.findToastPos(id)
    if (pos > -1) {
      this.toasts.splice(pos, 1)
    }
  }

  private genId(): number {
    return Store._counter += 1
  }

  private findModalPos(id: number): number {
    return this.modals.findIndex(modal => modal.id === id)
  }

  private findToastPos(id: number): number {
    return this.toasts.findIndex(toast => toast.id === id)
  }

  @action
  private setRecordsList(records: NoteRecord[]): void {
    this.records = records
  }

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

  @action
  private setProjectsList(projects: ProjectRecord[]): void {
    this.projects = projects
  }

  private errorHandler<T>(promise: Promise<T>, errorMsg: string): Promise<T> {
    return promise.catch(e => {
      this.showErrorToast(errorMsg, e)
      throw e
    })
  }

}
