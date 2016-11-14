import {action, observable} from 'mobx'
import {InjectStore} from 'web-client/injector'

import ModalsStore from 'web-client/modals/store'
import NotesStore from 'web-client/notes/store'

interface IPage {
  readonly name: string,
  readonly [propName: string]: any, // tslint:disable-line:no-any
}

export default class RoutingStore {
  @InjectStore modalsStore: ModalsStore
  @InjectStore notesStore: NotesStore

  @observable page: IPage
  @observable isLoading: boolean
  @observable error: undefined | Error = undefined

  constructor() {
    this.showNotFound('/')
  }

  showNotes(): void {
    this.showPage(
      { name: 'notes' },
      this.notesStore.loadRecordsList()
    )
  }

  showNotFound(url: string): void {
    this.showPage({ name: 'not-found', url })
  }

  @action
  private setIsLoading(isLoading: boolean): void {
    this.isLoading = false
  }

  @action
  private setError(error?: Error): void {
    this.error = error
  }

  @action
  private showPage(page: IPage, ...setup: Promise<any>[]): void { // tslint:disable-line:no-any
    this.page = page
    this.setError(undefined)

    this.setIsLoading(!!setup.length)

    if (!setup.length) {
      return
    }

    Promise.all(setup).then(
      () => {
        if (page.name !== this.page.name) {
          return
        }

        this.setIsLoading(false)
      },
      (err) => {
        if (page.name !== this.page.name) {
          return
        }

        this.setIsLoading(false)
        this.setError(err)
        this.modalsStore.showErrorToast(`Failed to load data for the page ${page.name}`, err)
      }
    )
  }

}
