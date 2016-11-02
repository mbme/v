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

async function createRandomTodo(projectId?: types.Id): Promise<types.ITodo> {
  if (!projectId) {
    const { id } = await createRandomProject()
    projectId = id
  }

  const [name, details] = randomTodo()
  const todo = await api.createProjectTodo(projectId, name, details)

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

  describe('createProjectTodo()', () => {
    it('should create new todo', async () => {
      const todo = await createRandomTodo()

      const todos = await api.listProjectTodos(todo.project_id)
      expect(todos.filter(item => item.id === todo.id)).to.have.lengthOf(1)
    })

    it('should not create todo in unexisting project', async () => {
      await expectFailure(createRandomTodo(randomInt()), 404)
    })
  })

  describe('updateProjectTodo()', () => {

  })

  describe('getProjectTodo()', () => {

  })
})
