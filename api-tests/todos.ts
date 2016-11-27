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
  const todo = await api.createTodo(projectId, name, details)

  validateTodo(todo, name, details, 'inbox')

  return todo
}

function validateTodo(
  body: types.ITodo,
  name: string,
  details: string,
  state: types.TodoState,
  startTs?: types.Timestamp,
  endTs?: types.Timestamp
): void {
  expect(body).to.be.an('object')

  expect(body).to.have.all.keys(
    'id',
    'name',
    'create_ts',
    'update_ts',
    'project_id',
    'details',
    'state',
    'start_ts',
    'end_ts',
    'files'
  )

  expect(body.id).to.be.a('number')
  expect(body.name).to.equal(name)
  expect(body.details).to.equal(details)
  expect(body.state).to.equal(state)
  expect(body.create_ts).to.be.a('number')
  expect(body.update_ts).to.be.a('number')
  if (startTs) {
    expect(body.start_ts).to.equal(startTs)
  }
  if (endTs) {
    expect(body.end_ts).to.equal(endTs)
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

      const todos = await api.listProjectTodos(todo.project_id)
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
        todo.id,
        name,
        details,
        state,
        startTs,
        endTs
      )

      validateTodo(updatedTodo, name, details, state, startTs, endTs)
      expect(updatedTodo.id).to.equal(todo.id)
    })

    it('should fail if trying to update non-existing todo', async () => {
      const [ name, details ] = randomTodo()

      await expectFailure(api.updateTodo(randomInt(), name, details, 'done'), 404)
    })

  })

  describe('getTodo()', () => {
    it('should return existing todo', async () => {
      const todo = await createRandomTodo()

      const todo1 = await api.readTodo(todo.id)
      validateTodo(todo1, todo.name, todo.details, todo.state)

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
