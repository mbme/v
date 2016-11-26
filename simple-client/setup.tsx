import * as React from 'react'
import { Store, UIStore } from './store'
import UIManager from './ui-manager'
import List from './list'

const store = new Store()

for (let i = 0; i < 100; i += 1) {
  store.createTodo(`todo item number ${i}`)
}
const uiStore = new UIStore()

uiStore.addPiece(
  <List items={store.todos.map(todo => todo.name)} />
)

export function render(): JSX.Element {
  return <UIManager store={uiStore} />
}
