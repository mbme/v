import {action, observable, computed, ObservableMap} from 'mobx'

import * as api from 'api-client'
import {
  IFileInfo,
} from 'api-client/types'
import {
  ProjectRecord,
  NoteRecord,
  Note,
  Todo,
  Modal,
  Toast,
  ToastType,
  ViewTypes,
} from 'web-client/utils/types'
import { config } from 'web-client/utils'

let _counter = 0
function genId(): number {
  return _counter += 1
}

export default class Store {
  @observable projects: ProjectRecord[] = []
  @observable todos: ObservableMap<Todo[]> = observable.map<Todo[]>()
  @observable openProjectId?: number

  @observable records: NoteRecord[] = []
  @observable openNotes: Note[] = []

  @observable modals: Modal[] = []
  @observable toasts: Toast[] = []

  @observable view: ViewTypes = 'todos'

  @action setView(view: ViewTypes): void {
    this.view = view
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

  @action openProject(projectId: number): void {
    this.openProjectId = projectId
    this.loadProjectTodos(projectId)
   }

  @action
  async loadProjectTodos(projectId: number): Promise<void> {
    const data = await this.errorHandler(
      api.listProjectTodos(projectId),
      `failed to load todos of project ${projectId}`
    )

    this.setProjectTodos(projectId, data.map(dto => new Todo(dto)))
  }

  @action
  openNote = async (id: number): Promise<void> => {
    if (this.indexOfNote(id) > -1) {
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

    this.addOpenNote(new Note(data, true))
    this.loadNotesList()
  }

  @action
  async updateNote(id: number, name: string, data: string): Promise<void> {
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
  async deleteNote(id: number): Promise<void> {
    await this.errorHandler(api.deleteNote(id), `failed to delete note ${id}`)

    this.closeNote(id)
    this.loadNotesList()
  }

  indexOfNote(id: number): number {
    return this.openNotes.findIndex(note => note.id === id)
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

  @computed get visibleModal(): Modal | undefined {
    if (this.modals.length > 0) {
      return this.modals[0]
    }
  }

  @action
  openModal(el: JSX.Element): number {
    const id = genId()
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
    const id = genId()
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

  @action
  private setProjectTodos(projectId: number, todos: Todo[]): void {
    this.todos.set(projectId.toString(), todos)
  }

  @action
  private addOpenNote(note: Note): void {
    this.openNotes.unshift(note)
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

  private getOpenNote(id: number): Note | undefined {
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
