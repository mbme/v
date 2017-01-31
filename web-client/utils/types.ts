import {
  observable,
  action,
} from 'mobx'

import {
  INote,
  IFileInfo,
} from 'api-client/types'
import {BaseModel} from 'web-client/utils'

export class Note {
  readonly id: number
  readonly name: string
  readonly createTs: number
  readonly updateTs: number
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
