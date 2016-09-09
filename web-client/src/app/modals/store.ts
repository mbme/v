import {action, observable, computed} from 'mobx'
import {toastExpirationMs} from 'config'

export type Id = number

interface IModal {
  id: Id,
  el: JSX.Element,
}

interface IToast {
  id: Id,
  content: JSX.Element | string,
}

export default class ModalsStore {
  private static _counter: number = 0

  @observable modals: IModal[] = []
  @observable toasts: IToast[] = []

  @computed get visibleModal(): IModal | undefined {
    if (this.modals.length > 0) {
      return this.modals[0]
    }
  }

  @action openModal(el: JSX.Element): Id {
    const id = this.genId()
    this.modals.unshift({ id, el })

    return id
  }

  @action updateModal(id: Id, el: JSX.Element): void {
    const pos = this.findModalPos(id)

    if (pos > -1) {
      this.modals.splice(pos, 1, { id, el })
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

  @action showToast(content: JSX.Element | string): void {
    const id = this.genId()
    this.toasts.unshift({ id, content })

    setTimeout(() => this.hideToast(id), toastExpirationMs)
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
