import {
  observable,
  action,
  asReference,
} from 'mobx'

import {
  Id,
  Timestamp,
  IRecord,
  INote,
  IFileInfo,
} from 'api-client/types'
import {BaseModel} from 'web-client/utils'

export class ProjectRecord {
  readonly id: Id
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
  readonly id: Id
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

export class Modal extends BaseModel {
  readonly id: number
  @observable readonly el: JSX.Element

  constructor(id: number, el: JSX.Element) {
    super('Modal')

    this.id = id
    this.el = asReference(el)
  }
}

export type ToastType = 'normal' | 'error'
type ToastContent = JSX.Element | string

export class Toast extends BaseModel {
  readonly id: number
  readonly type: ToastType
  @observable readonly content: ToastContent

  constructor(id: number, type: ToastType, content: ToastContent) {
    super('Toast')

    this.id = id
    this.type = type
    this.content = asReference(content)
  }
}
