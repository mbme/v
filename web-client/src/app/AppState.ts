import NotesStore from 'notes/store'
import ModalsStore from 'modals/store'

export class AppState {
  readonly notesStore: NotesStore
  readonly modalsStore: ModalsStore

  constructor() {
    this.notesStore = new NotesStore()
    this.modalsStore = new ModalsStore()
  }

  init(): void {
    this.notesStore.loadRecordsList()
      .catch(err => this.modalsStore.showErrorToast('Failed to load records list', err))
  }
}

export function initState(): AppState {
  const state = new AppState()
  state.init()

  return state
}
