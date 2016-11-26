import {action, observable} from 'mobx'
import 'react'

type TodoState = 'inbox' | 'todo' | 'in-progress' | 'done'

interface ITodo {
  readonly id: number
  readonly name: string
  readonly state: TodoState
}

interface INote {
  readonly id: number
  readonly name: string
  readonly data: string
}

let _id = 0

export class Store {
  @observable todos: ITodo[] = []
  @observable notes: INote[] = []

  @action createTodo(name: string, state: TodoState = 'inbox'): ITodo {
    const todo = {
      id: _id += 1, name, state,
    }

    this.addTodo(todo)

    return todo
  }

  @action addTodo(todo: ITodo): void {
    this.todos.push(todo)
  }

  @action removeTodo(todo: ITodo): void {
    this.todos.splice(this.todos.indexOf(todo), 1)
  }

  @action createNote(name: string, data: string): INote {
    const note = {
      id: _id += 1, name, data
    }

    this.addNote(note)

    return note
  }

  @action addNote(note: INote): void {
    this.notes.push(note)
  }

  @action removeNote(note: INote): void {
    this.notes.splice(this.notes.indexOf(note), 1)
  }
}

export class UIStore {
  @observable pieces: JSX.Element[] = []

  @action addPiece(el: JSX.Element): void {
    this.pieces.push(el)
  }
}
