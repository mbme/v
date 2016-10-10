import {action, observable, computed, asReference} from 'mobx'
import {toastExpirationMs} from 'web-client/config'
import {BaseModel} from 'web-client/utils'

export type Id = number

class Modal extends BaseModel {
  readonly id: Id
  @observable readonly el: JSX.Element

  constructor(id: Id, el: JSX.Element) {
    super('Modal')

    this.id = id
    this.el = asReference(el)
  }
}

export type ToastType = 'normal' | 'error'
type ToastContent = JSX.Element | string

export class Toast extends BaseModel {
  readonly id: Id
  readonly type: ToastType
  @observable readonly content: ToastContent

  constructor(id: Id, type: ToastType, content: ToastContent) {
    super('Toast')

    this.id = id
    this.type = type
    this.content = asReference(content)
  }
}

export default class ModalsStore {
  private static _counter: number = 0

  @observable modals: Modal[] = []
  @observable toasts: Toast[] = []

  @computed get visibleModal(): Modal | undefined {
    if (this.modals.length > 0) {
      return this.modals[0]
    }
  }

  @action openModal(el: JSX.Element): Id {
    const id = this.genId()
    this.modals.unshift(new Modal(id, el))

    return id
  }

  @action updateModal(id: Id, el: JSX.Element): void {
    const pos = this.findModalPos(id)

    if (pos > -1) {
      this.modals.splice(pos, 1, new Modal(id, el))
    } else {
      throw new Error(`Can't find modal with id ${id}`)
    }
  }

  @action closeModal(id: Id): void {
    const pos = this.findModalPos(id)
    if (pos > -1) {
      this.modals.splice(pos, 1)
    }
  }

  @action showToast(content: JSX.Element | string, type: ToastType = 'normal'): void {
    const id = this.genId()
    this.toasts.unshift(new Toast(id, type, content))

    setTimeout(() => this.hideToast(id), toastExpirationMs)
  }

  showErrorToast(msg: string, err: Error): void {
    this.showToast(`${msg}: ${err.toString()}`, 'error')
  }

  @action
  private hideToast(id: Id): void {
    const pos = this.findToastPos(id)
    if (pos > -1) {
      this.toasts.splice(pos, 1)
    }
  }

  private genId(): Id {
    return ModalsStore._counter += 1
  }

  private findModalPos(id: Id): number {
    return this.modals.findIndex(modal => modal.id === id)
  }

  private findToastPos(id: Id): number {
    return this.toasts.findIndex(toast => toast.id === id)
  }
}
