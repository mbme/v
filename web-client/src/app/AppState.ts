import NotesStore from 'notes/store'
import ModalsStore from 'modals/store'

export default class AppState {
  readonly notesStore: NotesStore
  readonly modalsStore: ModalsStore

  constructor() {
    this.notesStore = new NotesStore()
    this.modalsStore = new ModalsStore()
  }

  init(): void {
    this.notesStore.loadRecordsList()
  }
}
