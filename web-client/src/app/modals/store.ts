import {action, observable, computed} from 'mobx'

type Id = number

interface IModal {
  id: Id,
  el: JSX.Element,
}

export default class ModalsStore {
  @observable modals: IModal[] = []

  @computed get visibleModal(): IModal | undefined {
    if (this.modals.length > 0) {
      return this.modals[0]
    }
  }

  @action open(id: Id, el: JSX.Element): void {
    this.modals.unshift({ id, el })
  }

  @action close(id: Id): void {
    const pos = this.modals.findIndex(modal => modal.id === id)
    if (pos > -1) {
      this.modals.splice(pos, 1)
    }
  }

}
