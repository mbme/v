import {action, observable} from 'mobx'

interface IPage {
  readonly name: string,
  [propName: string]: any, // tslint:disable-line:no-any
}

export default class RoutingStore {
  @observable page: IPage

  constructor() {
    this.showNotFound('/')
  }

  @action showNotes(): void {
    this.page = {
      name: 'notes',
    }
  }

  @action showNotFound(url: string): void {
    this.page = {
      name: 'not-found',
      url,
    }
  }
}
