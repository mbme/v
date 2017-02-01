import {observable} from 'mobx'
import {BaseModel} from 'web-client/utils'

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
