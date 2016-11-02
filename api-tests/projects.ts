import { expect } from 'chai'
import {
  randomProject,
  expectFailure,
  randomInt,
} from './utils'
import * as api from 'api-client'
import * as types from 'api-client/types'

function validateProject(body: types.IProject, name: string, description: string = ''): void {
  expect(body).to.be.an('object')

  expect(body).to.have.all.keys(
    'id', 'name', 'description', 'create_ts', 'update_ts', 'files'
  )

  expect(body.id).to.be.a('number')
  expect(body.name).to.equal(name)
  expect(body.description).to.equal(description)
  expect(body.files).to.be.an('array')
  expect(body.create_ts).to.be.a('number')
  expect(body.update_ts).to.be.a('number')
}

describe('Projects API', () => {

  describe('listProjects()', () => {
    it('should return an array', async () => {
      const list = await api.listProjects()

      expect(list).to.be.an('array')
    })
  })

  describe('createProject()', () => {
    it('should create new project', async () => {
      const [name] = randomProject()

      const project = await api.createProject(name)

      validateProject(project, name)

      const projects = await api.listProjects()
      expect(projects.filter(p => p.name === name)).to.have.lengthOf(1)
    })
  })

  describe('readProject()', () => {
    it('should return existing project', async () => {
      const [name, description] = randomProject()

      const { id } = await api.createProject(name, description)

      const project = await api.readProject(id)
      validateProject(project, name, description)
      expect(project.id).to.equal(id)
    })

    it('should return 404 NOT FOUND for non-existing project', async () => {
      await expectFailure(api.readProject(randomInt()), 404)
    })

    it('should return 400 BAD REQUEST for invalid ids', async () => {
      await expectFailure(
        api.readProject('some-invalid-id' as any), 400 // tslint:disable-line:no-any
      )
    })
  })

  describe('updateProject()', () => {
    it('should update project', async () => {
      const [name, description] = randomProject()
      const [name1, description1] = randomProject()

      const { id } = await api.createProject(name, description)

      await api.updateProject(id, name1, description1)

      const project = await api.readProject(id)
      validateProject(project, name1, description1)
      expect(project.id).to.equal(id)
    })

    it('should fail if trying to update non-existing project', async () => {
      const [name, description] = randomProject()

      await expectFailure(api.updateProject(randomInt(), name, description), 404)
    })
  })
})
