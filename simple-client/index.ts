import {action, observable} from 'mobx'

type TodoState = 'inbox' | 'todo' | 'in-progress' | 'done'

class Todo {
  id: number
  @observable name: string
  @observable state: TodoState
}

let _id = 0

class State {
  @observable todos: Todo[] = []

  @action addTodo(name: string): void {
    this.todos.push({ id: _id += 1, name, state: 'inbox' })
  }
}

new State()
