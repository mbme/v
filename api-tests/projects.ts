import { expect } from 'chai'
import { uniq, expectFailure, randomInt } from './utils'
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

function randomProject(): [string, string] {
  return [uniq('name'), uniq('description')]
}

describe('Projects API', () => {

  describe('listProjects()', () => {
    it('should return an array', () => {
      return api.listProjects().then(
        (list) => {
          expect(list).to.be.an('array')
        }
      )
    })
  })

  describe('createProject()', () => {
    it('should create new project', () => {
      const [name] = randomProject()

      return api.createProject(
        name
      ).then((resp) => {
        validateProject(resp, name)

        return api.listProjects()
      }).then((projects) => { // check if new project is searchable
        expect(projects.filter(project => project.name === name)).to.have.lengthOf(1)
      })
    })
  })

  describe('readProject()', () => {
    it('should return existing project', () => {
      const [name, description] = randomProject()

      let id: types.Id

      return api.createProject(
        name, description
      ).then((resp) => {
        id = resp.id

        return api.readProject(id)
      }).then((resp) => {
        validateProject(resp, name, description)
        expect(resp.id).to.equal(id)
      })
    })

    it('should return 404 NOT FOUND for non-existing project', () => {
      return expectFailure(api.readProject(randomInt()), 404)
    })

    it('should return 400 BAD REQUEST for invalid ids', () => {
      return expectFailure(
        api.readProject('some-invalid-id' as any), 400 // tslint:disable-line:no-any
      )
    })
  })

  describe('updateProject()', () => {
    it('should update project', () => {
      const [name, description] = randomProject()
      const [name1, description1] = randomProject()

      let id: types.Id
      return api.createProject(name, description)
        .then((resp) => {
          id = resp.id

          return api.updateProject(id, name1, description1)
        })
        .then(() => api.readProject(id))
        .then((resp) => {
          validateProject(resp, name1, description1)
          expect(resp.id).to.equal(id)
        })
    })

    it('should fail if trying to update non-existing project', () => {
      const [name, description] = randomProject()

      return expectFailure(api.updateProject(randomInt(), name, description), 404)
    })
  })
})
