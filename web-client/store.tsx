import {observable, computed} from 'mobx'

import * as api from 'api-client'
import { IFileInfo, IRecord, INote, ITodo, ITodoData, TodoState, } from 'api-client/types'
import { Modal, Toast, ToastType, ViewTypes, } from 'web-client/utils/types'
import { config } from 'web-client/utils'

class FilesStore {
  constructor(protected uiStore: UIStore) {}

  async uploadFile(recordId: number, name: string, file: File): Promise<void> {
    await this.uiStore.errorHandler(
      api.uploadFile(recordId, name, file),
      `failed to upload file for record ${recordId}`
    )
  }

  deleteFile(recordId: number, file: IFileInfo): Promise<void> {
    return this.uiStore.errorHandler(
      api.deleteFile(recordId, file.name),
      `failed to delete file of record ${recordId}`
    )
  }

  loadFiles(recordId: number): Promise<IFileInfo[]> {
    return this.uiStore.errorHandler(
      api.listFiles(recordId),
      `failed to list files of record ${recordId}`
    )
  }
}

class NotesStore {
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

class TodosStore {
  @observable projects: ReadonlyArray<IRecord> = []
  @observable todos?: ReadonlyArray<ITodo>
  @observable projectId?: number

  constructor(private uiStore: UIStore) {}

  async loadProjectsList(): Promise<void> {
    const data = await this.uiStore.errorHandler(api.listProjects(), 'failed to load projects list')
    this.projects = data
  }

  async openProject(projectId: number): Promise<void> {
    this.projectId = projectId

    const data = await this.uiStore.errorHandler(
      api.listProjectTodos(projectId),
      `failed to load todos of project ${projectId}`
    )

    if (this.projectId === projectId) {
      this.todos = data
    }
  }

  async closeProject(projectId: number): Promise<void> {
    if (this.projectId !== projectId) {
      return
    }

    this.projectId = undefined
    this.todos = undefined
  }

  async addTodo(projectId: number, name: string): Promise<void> {
    await this.uiStore.errorHandler(
      api.createTodo(projectId, { name, details: '' }),
      `failed to create todo in project ${projectId}'`
    )

    if (this.projectId === projectId) {
      this.openProject(projectId)
    }
  }

  async updateTodo(projectId: number, data: ITodoData, state: TodoState): Promise<void> {
    await this.uiStore.errorHandler(
      api.updateTodo(projectId, data, state),
      `failed to update todo in project ${projectId}'`
    )

    if (this.projectId === projectId) {
      this.openProject(projectId)
    }
  }
}

class UIStore {
  @observable modals: Modal[] = []
  @observable toasts: Toast[] = []

  @observable view: ViewTypes = 'todos'

  setView(view: ViewTypes): void {
    this.view = view
  }

  @computed get visibleModal(): Modal | undefined {
    if (this.modals.length > 0) {
      return this.modals[0]
    }
  }

  openModal(el: JSX.Element): number {
    const id = Date.now()

    this.modals.unshift(new Modal(id, el))

    return id
  }

  updateModal(id: number, el: JSX.Element): void {
    const pos = this.findModalPos(id)

    if (pos > -1) {
      this.modals.splice(pos, 1, new Modal(id, el))
    } else {
      throw new Error(`Can't find modal with id ${id}`)
    }
  }

  closeModal(id: number): void {
    const pos = this.findModalPos(id)
    if (pos > -1) {
      this.modals.splice(pos, 1)
    }
  }

  showToast(content: JSX.Element | string, type: ToastType = 'normal'): void {
    const id = Date.now()
    this.toasts.unshift(new Toast(id, type, content))

    setTimeout(() => this.hideToast(id), config.toastExpirationMs)
  }

  showErrorToast(msg: string, err: Error): void {
    this.showToast(`${msg}: ${err.toString()}`, 'error')
  }

  errorHandler<T>(promise: Promise<T>, errorMsg: string): Promise<T> {
    return promise.catch(e => {
      this.showErrorToast(errorMsg, e)
      throw e
    })
  }

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
}

export const uiStore = new UIStore()
export const filesStore = new FilesStore(uiStore)
export const notesStore = new NotesStore(uiStore)
export const todosStore = new TodosStore(uiStore)
