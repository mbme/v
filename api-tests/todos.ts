import { expect } from 'chai'
import {
  randomProject,
  randomTodo,
  expectFailure,
  randomInt,
} from './utils'
import * as api from 'api-client'
import * as types from 'api-client/types'

function createRandomProject(): Promise<types.IProject> {
  const [name, description] = randomProject()
  return api.createProject(name, description)
}

async function createRandomTodo(projectId?: number): Promise<types.ITodo> {
  if (!projectId) {
    const { id } = await createRandomProject()
    projectId = id
  }

  const [name, details] = randomTodo()
  const todo = await api.createTodo(projectId, { name, details })

  validateTodo(todo, { name, details }, 'inbox')

  return todo
}

function validateTodo(body: types.ITodo, data: types.ITodoData, state: types.TodoState): void {
  expect(body).to.be.an('object')

  expect(body).to.have.all.keys(
    'id',
    'name',
    'createTs',
    'updateTs',
    'projectId',
    'details',
    'state',
    'startTs',
    'endTs',
    'files'
  )

  expect(body.id).to.be.a('number')
  expect(body.name).to.equal(data.name)
  expect(body.details).to.equal(data.details)
  expect(body.state).to.equal(state)
  expect(body.createTs).to.be.a('number')
  expect(body.updateTs).to.be.a('number')
  if (data.startTs) {
    expect(body.startTs).to.equal(data.startTs)
  }
  if (data.endTs) {
    expect(body.endTs).to.equal(data.endTs)
  }
  expect(body.files).to.be.an('array')
}

describe('Todos API', () => {
  describe('listProjectTodos()', () => {
    it('should return an array', async () => {
      const { id } = await createRandomProject()
      const list = await api.listProjectTodos(id)
      expect(list).to.be.an('array')
    })
  })

  describe('createTodo()', () => {
    it('should create new todo', async () => {
      const todo = await createRandomTodo()

      const todos = await api.listProjectTodos(todo.projectId)
      expect(todos.filter(item => item.id === todo.id)).to.have.lengthOf(1)
    })

    it('should not create todo in unexisting project', async () => {
      await expectFailure(createRandomTodo(randomInt()), 404)
    })
  })

  describe('updateTodo()', () => {
    it('should update todo', async () => {
      const todo = await createRandomTodo()

      const [ name, details ] = randomTodo()
      const state: types.TodoState = 'done'
      const startTs = 99
      const endTs = 101

      const updatedTodo = await api.updateTodo(
        todo.id, { name, details, startTs, endTs }, state
      )

      validateTodo(updatedTodo, { name, details, startTs, endTs }, state)
      expect(updatedTodo.id).to.equal(todo.id)
    })

    it('should fail if trying to update non-existing todo', async () => {
      const [ name, details ] = randomTodo()

      await expectFailure(api.updateTodo(randomInt(), { name, details }, 'done'), 404)
    })

  })

  describe('getTodo()', () => {
    it('should return existing todo', async () => {
      const todo = await createRandomTodo()

      const todo1 = await api.readTodo(todo.id)
      validateTodo(todo1, { name: todo.name, details: todo.details }, todo.state)

      expect(todo1.id).to.equal(todo.id)
    })

    it('should return 404 NOT FOUND for non-existing todo', async () => {
      await expectFailure(api.readTodo(randomInt()), 404)
    })

    it('should return 400 BAD REQUEST for invalid ids', async () => {
      await expectFailure(
        api.readTodo('some-invalid-id' as any), 400 // tslint:disable-line:no-any
      )
    })
  })
})
