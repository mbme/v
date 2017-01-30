import {
  observable,
  action,
} from 'mobx'

import {
  Timestamp,
  IRecord,
  INote,
  ITodo,
  TodoState,
  IFileInfo,
} from 'api-client/types'
import {BaseModel} from 'web-client/utils'

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

export class Todo {
  readonly id: number
  readonly name: string
  readonly createTs: Timestamp
  readonly updateTs: Timestamp
  readonly projectId: number
  readonly details: string
  readonly state: TodoState
  readonly startTs: Timestamp
  readonly endTs: Timestamp
  readonly files: ReadonlyArray<IFileInfo>

  constructor(todo: ITodo) {
    this.id = todo.id
    this.name = todo.name
    this.createTs = todo.create_ts
    this.updateTs = todo.update_ts
    this.projectId = todo.project_id
    this.details = todo.details
    this.state = todo.state
    this.startTs = todo.start_ts
    this.endTs = todo.end_ts
    this.files = todo.files
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

  @observable files: ReadonlyArray<IFileInfo>

  @observable editMode: boolean // FIXME use states: 'loading' | 'edit' | 'view'

  constructor (dto: INote, editMode: boolean = false) {
    this.id = dto.id
    this.name = dto.name
    this.createTs = dto.create_ts
    this.updateTs = dto.update_ts
    this.data = dto.data
    this.files = dto.files

    this.editMode = editMode
  }

  @action edit(edit: boolean): void {
    this.editMode = edit
  }
}

export class Modal extends BaseModel {
  readonly id: number
  @observable.ref readonly el: JSX.Element // FIXME wtf?? observable readonly?

  constructor(id: number, el: JSX.Element) {
    super('Modal')

    this.id = id
    this.el = el
  }
}

export type ToastType = 'normal' | 'error'
type ToastContent = JSX.Element | string

export class Toast extends BaseModel {
  readonly id: number
  readonly type: ToastType
  @observable.ref readonly content: ToastContent

  constructor(id: number, type: ToastType, content: ToastContent) {
    super('Toast')

    this.id = id
    this.type = type
    this.content = content
  }
}

export type ViewTypes = 'notes' | 'todos'
