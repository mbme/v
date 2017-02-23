import { observable } from 'mobx'

import UIStore from './ui'

import * as api from 'api-client'
import { IRecord, ITodo, ITodoData, TodoState } from 'api-client/types'

export default class TodosStore {
  @observable projects: IRecord[] = []
  @observable todos?: ITodo[]
  @observable projectId?: number

  constructor(private uiStore: UIStore) {}

  async loadProjectsList(): Promise<void> {
    const data = await this.uiStore.errorHandler(api.listProjects(), 'failed to load projects list')
    this.projects = data
  }

  async openProject(projectId: number): Promise<void> {
    this.projectId = projectId

    const data = await this.uiStore.errorHandler(
      api.listProjectTodos(projectId),
      `failed to load todos of project ${projectId}`
    )

    if (this.projectId === projectId) {
      this.todos = data
    }
  }

  async closeProject(projectId: number): Promise<void> {
    if (this.projectId !== projectId) {
      return
    }

    this.projectId = undefined
    this.todos = undefined
  }

  async addTodo(projectId: number, name: string): Promise<void> {
    await this.uiStore.errorHandler(
      api.createTodo(projectId, { name, details: '' }),
      `failed to create todo in project ${projectId}'`
    )

    if (this.projectId === projectId) {
      this.openProject(projectId)
    }
  }

  async updateTodo(projectId: number, id: number, data: ITodoData, state: TodoState): Promise<void> {
    await this.uiStore.errorHandler(
      api.updateTodo(id, data, state),
      `failed to update todo ${id} in project ${projectId}'`
    )

    if (this.projectId === projectId) {
      this.openProject(projectId)
    }
  }

  updateTodoState(todo: ITodo, state: TodoState): Promise<void> {
    return this.updateTodo(todo.projectId, todo.id, todo, state)
  }
}
