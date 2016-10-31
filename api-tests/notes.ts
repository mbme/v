import { expect } from 'chai'
import {
  randomNote,
  NoteDTO,
  randomInt,
  forceTypeCast,
  expectFailure,
} from './utils'
import * as types from 'api-client/types'
import * as api from 'api-client'

function validateNote(body: types.INote, expected: NoteDTO): void {
  expect(body).to.be.an('object')

  expect(body).to.have.all.keys(
    'id', 'name', 'data', 'create_ts', 'update_ts', 'files'
  )

  expect(body.id).to.be.a('number')
  expect(body.name).to.equal(expected.name)
  expect(body.data).to.equal(expected.data)
  expect(body.files).to.be.an('array')
  expect(body.create_ts).to.be.a('number')
  expect(body.update_ts).to.be.a('number')
}

describe('Notes API', () => {
  describe('listNotes()', () => {
    it('should return an array', () => {
      return api.listNotes().then(
        (list) => {
          expect(list).to.be.an('array')
        }
      )
    })
  })

  describe('createNote()', () => {
    it('should create new note', () => {
      const note = randomNote()

      return api.createNote(
        note.name, note.data
      ).then((resp) => {
        validateNote(resp, note)

        return api.listNotes()
      }).then((notes) => { // check if new note is searchable
        expect(notes.filter(rec => rec.name === note.name)).to.have.lengthOf(1)
      })
    })
  })

  describe('readNote()', () => {
    it('should return existing note', () => {
      const note = randomNote()

      let noteId: types.Id

      return api.createNote(
        note.name, note.data
      ).then((resp) => {
        noteId = resp.id

        return api.readNote(noteId)
      }).then((resp) => {
        validateNote(resp, note)
        expect(resp.id).to.equal(noteId)
      })
    })

    it('should return 404 NOT FOUND for non-existing note', () => {
      return expectFailure(api.readNote(randomInt()), 404)
    })

    it('should return 400 BAD REQUEST for invalid ids', () => {
      return expectFailure(
        api.readNote(forceTypeCast<number>('some-invalid-id')), 400
      )
    })
  })

  describe('updateNote()', () => {
    it('should update note', () => {
      const note = randomNote()
      const note1 = randomNote()

      let id: types.Id
      return api.createNote(note.name, note.data)
        .then((resp) => {
          id = resp.id

          // update note
          return api.updateNote(id, note1.name, note1.data)
        })
        .then(() => api.readNote(id))
        .then((resp) => {
          validateNote(resp, note1)
          expect(resp.id).to.equal(id)
        })
    })

    it('should fail if trying to update non-existing note', () => {
      const note = randomNote()

      return expectFailure(api.updateNote(randomInt(), note.name, note.data), 404)
    })
  })

  describe('deleteNote()', () => {
    it('should remove note', () => {
      const note = randomNote()

      let id: types.Id
      return expectFailure(
        api.createNote(note.name, note.data)
          .then((resp) => {
            id = resp.id

            return api.deleteNote(id)
          })
          .then(() => api.readNote(id)),
        404
      )
    })

    it('should fail if trying to delete non-existing note', () => {
      return expectFailure(api.deleteNote(randomInt()), 404)
    })
  })

})
