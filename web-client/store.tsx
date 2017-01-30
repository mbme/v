import {action, observable, computed, ObservableMap} from 'mobx'

import * as api from 'api-client'
import {IFileInfo} from 'api-client/types'
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

class FilesStore {
  constructor(protected uiStore: UIStore) {}

  @action async uploadFile(recordId: number, name: string, file: File): Promise<void> {
    await this.uiStore.errorHandler(
      api.uploadFile(recordId, name, file),
      `failed to upload file for record ${recordId}`
    )
  }

  @action deleteFile(recordId: number, file: IFileInfo): Promise<void> {
    return this.uiStore.errorHandler(
      api.deleteFile(recordId, file.name),
      `failed to delete file of record ${recordId}`
    )
  }

  @action loadFiles(recordId: number): Promise<IFileInfo[]> {
    return this.uiStore.errorHandler(
      api.listFiles(recordId),
      `failed to list files of record ${recordId}`
    )
  }
}

class NotesStore {
  @observable noteRecords: NoteRecord[] = []
  @observable note?: Note

  constructor(private uiStore: UIStore) {}

  @action async loadNoteRecords(): Promise<void> {
    const data = await this.uiStore.errorHandler(api.listNotes(), 'failed to load notes list')

    this.setNoteRecords(data.map(dto => new NoteRecord(dto)))
  }

  isOpenNote(id: number): boolean {
    return !!this.note && this.note.id === id
  }

  @action openNote = async (id: number): Promise<void> => {
    if (this.isOpenNote(id)) {
      return
    }

    const data = await this.uiStore.errorHandler(api.readNote(id), `failed to read note ${id}`)
    this.setNote(new Note(data))
  }

  @action closeNote(id: number): void {
    this.setNote(undefined, id)
  }

  @action async createNote(name: string): Promise<void> {
    const data = await this.uiStore.errorHandler(api.createNote(name), 'failed to create note')

    this.setNote(new Note(data, true))
    this.loadNoteRecords()
  }

  @action async updateNote(id: number, name: string, data: string): Promise<void> {
    const note = await this.uiStore.errorHandler(
      api.updateNote(id, name, data),
      `failed to update note ${id}`
    )

    if (!this.note) {
      return
    }

    this.setNote(new Note(note, this.note.editMode), id)
    this.loadNoteRecords()
  }

  @action async deleteNote(id: number): Promise<void> {
    await this.uiStore.errorHandler(api.deleteNote(id), `failed to delete note ${id}`)

    this.closeNote(id)
    this.loadNoteRecords()
  }

  @action updateNoteFiles(noteId: number, files: IFileInfo[]): void {
    if (!this.note || this.note.id !== noteId) {
      return
    }

    this.note.files = files
  }

  @action private setNoteRecords(records: NoteRecord[]): void {
    this.noteRecords = records
  }

  @action private setNote(note?: Note, id?: number): void {
    if (!this.note && id) {
      return
    }

    if (this.note && id && this.note.id !== id) {
      return
    }

    this.note = note
  }
}

class TodosStore {
  @observable projects: ProjectRecord[] = []
  @observable todos: ObservableMap<Todo[]> = observable.map<Todo[]>()
  @observable openProjectId?: number

  constructor(private uiStore: UIStore) {}

  @action async loadProjectsList(): Promise<void> {
    const data = await this.uiStore.errorHandler(api.listProjects(), 'failed to load projects list')
    this.setProjectsList(data.map(dto => new ProjectRecord(dto)))
  }

  @action openProject(projectId: number): void {
    this.openProjectId = projectId
    this.loadProjectTodos(projectId)
  }

  @action async loadProjectTodos(projectId: number): Promise<void> {
    const data = await this.uiStore.errorHandler(
      api.listProjectTodos(projectId),
      `failed to load todos of project ${projectId}`
    )

    this.setProjectTodos(projectId, data.map(dto => new Todo(dto)))
  }

  @action private setProjectTodos(projectId: number, todos: Todo[]): void {
    this.todos.set(projectId.toString(), todos)
  }

  @action private setProjectsList(projects: ProjectRecord[]): void {
    this.projects = projects
  }
}

class UIStore {
  @observable modals: Modal[] = []
  @observable toasts: Toast[] = []

  @observable view: ViewTypes = 'todos'

  @action setView(view: ViewTypes): void {
    this.view = view
  }

  @computed get visibleModal(): Modal | undefined {
    if (this.modals.length > 0) {
      return this.modals[0]
    }
  }

  @action openModal(el: JSX.Element): number {
    const id = Date.now()

    this.modals.unshift(new Modal(id, el))

    return id
  }

  @action updateModal(id: number, el: JSX.Element): void {
    const pos = this.findModalPos(id)

    if (pos > -1) {
      this.modals.splice(pos, 1, new Modal(id, el))
    } else {
      throw new Error(`Can't find modal with id ${id}`)
    }
  }

  @action closeModal(id: number): void {
    const pos = this.findModalPos(id)
    if (pos > -1) {
      this.modals.splice(pos, 1)
    }
  }

  @action showToast(content: JSX.Element | string, type: ToastType = 'normal'): void {
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

  @action private hideToast(id: number): void {
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
