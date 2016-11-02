import { expect } from 'chai'
import {
  randomNote,
  randomInt,
  expectFailure,
} from './utils'
import * as types from 'api-client/types'
import * as api from 'api-client'

function validateNote(body: types.INote, name: string, data: string = ''): void {
  expect(body).to.be.an('object')

  expect(body).to.have.all.keys(
    'id', 'name', 'data', 'create_ts', 'update_ts', 'files'
  )

  expect(body.id).to.be.a('number')
  expect(body.name).to.equal(name)
  expect(body.data).to.equal(data)
  expect(body.files).to.be.an('array')
  expect(body.create_ts).to.be.a('number')
  expect(body.update_ts).to.be.a('number')
}

describe('Notes API', () => {
  describe('listNotes()', () => {
    it('should return an array', async () => {
      const list = await api.listNotes()
      expect(list).to.be.an('array')
    })
  })

  describe('createNote()', () => {
    it('should create new note', async () => {
      const [ name, data ] = randomNote()

      const note = await api.createNote(name, data)
      validateNote(note, name, data)

      const notes = await api.listNotes()
      expect(notes.filter(rec => rec.name === name)).to.have.lengthOf(1)
    })
  })

  describe('readNote()', () => {
    it('should return existing note', async () => {
      const [ name, data ] = randomNote()

      const { id } = await api.createNote(name, data)

      const note = await api.readNote(id)
      validateNote(note, name, data)
      expect(note.id).to.equal(id)
    })

    it('should return 404 NOT FOUND for non-existing note', async () => {
      await expectFailure(api.readNote(randomInt()), 404)
    })

    it('should return 400 BAD REQUEST for invalid ids', async () => {
      await expectFailure(
        api.readNote('some-invalid-id' as any), 400 // tslint:disable-line:no-any
      )
    })
  })

  describe('updateNote()', () => {
    it('should update note', async () => {
      const [ name, data ] = randomNote()
      const [ name1, data1 ] = randomNote()

      const { id } = await api.createNote(name, data)

      await api.updateNote(id, name1, data1)

      const note = await api.readNote(id)
      validateNote(note, name1, data1)
      expect(note.id).to.equal(id)
    })

    it('should fail if trying to update non-existing note', async () => {
      const [ name, data ] = randomNote()

      await expectFailure(api.updateNote(randomInt(), name, data), 404)
    })
  })

  describe('deleteNote()', () => {
    it('should remove note', async () => {
      const [ name, data ] = randomNote()

      const { id } = await api.createNote(name, data)
      await api.deleteNote(id)

      await expectFailure(api.readNote(id), 404)
    })

    it('should fail if trying to delete non-existing note', async () => {
      await expectFailure(api.deleteNote(randomInt()), 404)
    })
  })

})
