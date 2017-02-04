import UIStore from './ui'
import FilesStore from './files'
import TodosStore from './todos'
import NotesStore from './notes'

export const uiStore = new UIStore()
export const filesStore = new FilesStore(uiStore)
export const notesStore = new NotesStore(uiStore)
export const todosStore = new TodosStore(uiStore)
