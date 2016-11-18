import {action, observable} from 'mobx'
import {InjectStore} from 'web-client/injector'

import ModalsStore from 'web-client/modals/store'
import NotesStore from 'web-client/notes/store'

export type IPageName = 'main' | 'notes' | 'not-found'

interface IPage {
  readonly name: IPageName,
  readonly url: string,
  readonly [propName: string]: any, // tslint:disable-line:no-any
}

export default class RoutingStore {
  @InjectStore modalsStore: ModalsStore
  @InjectStore notesStore: NotesStore

  @observable page: IPage

  constructor() {
    this.showMainPage()
  }

  showNotes(): void {
    this.showPage({ name: 'notes', url: '/notes' })
  }

  showMainPage(): void {
    this.showPage({ name: 'main', url: '/' })
  }

  showNotFound(url: string): void {
    this.showPage({ name: 'not-found', url })
  }

  openPage(name: IPageName): void {
    switch (name) {
      case 'main':
        this.showMainPage()
        break
      case 'notes':
        this.showNotes()
        break
      default:
        this.showNotFound('404')
        break
    }
  }

  @action
  private showPage(page: IPage): void {
    this.page = page
  }

}
