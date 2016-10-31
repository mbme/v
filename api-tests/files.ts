import { expect } from 'chai'
import {
  uniq,
  randomNote,
  randomInt,
  expectFailure,
  readBinaryFile,
} from './utils'
import * as api from 'api-client'
import * as types from 'api-client/types'

type FileInfoDTO = { name: string }

function validateFileInfo(body: types.IFileInfo, expected: FileInfoDTO): void {
  expect(body).to.have.all.keys(
    'name', 'size', 'create_ts'
  )

  expect(body.name).to.equal(expected.name)
  expect(body.size).to.be.a('number')
  expect(body.size).to.be.above(0)
  expect(body.create_ts).to.be.a('number')
}

function genAttachmentName(): string {
  const name = uniq('attachment')
  return `${name}.jpg`
}

const fileBuffer = readBinaryFile('./api-tests/data/city-view.jpg')

function postStandardFile(recordId: types.Id, name: types.FileName): Promise<types.IFileInfo> {
  return api.uploadFile(recordId, name, fileBuffer)
}

function postRandomNote(): Promise<types.INote> {
  const { name, data } = randomNote()
  return api.createNote(name, data)
}

describe('Files API', () => {

  describe('listFiles()', () => {
    it('should return all files attached to the record', () => {
      let noteId: types.Id
      return postRandomNote().then((resp) => noteId = resp.id)
        .then(() => postStandardFile(noteId, genAttachmentName()))
        .then(() => postStandardFile(noteId, genAttachmentName()))
        .then(() => Promise.all([api.readNote(noteId), api.listFiles(noteId)]))
        .then(([note, files]) => {
          expect(files).to.deep.equal(note.files)
        })
    })

    it('should return 404 NOT FOUND for non-existing record', () => {
      return expectFailure(api.listFiles(randomInt()), 404)
    })

    it('should return 400 BAD REQUEST for invalid ids', () => {
      return expectFailure(
        api.listFiles('some-invalid-id' as any),  // tslint:disable-line:no-any
        400
      )
    })
  })

  describe('uploadFile()', () => {
    it('should create new file', () => {
      const fileName = genAttachmentName()

      return postRandomNote()
        .then((resp) => postStandardFile(resp.id, fileName))
        .then((resp) => {
          validateFileInfo(resp, {
            'name': fileName,
          })
        })
    })

    it('should fail if trying to add file to non-existing record', () => {
      return expectFailure(postStandardFile(randomInt(), genAttachmentName()), 404)
    })
  })

  describe('readFile()', () => {
    it('should return file content', () => {
      const fileName = genAttachmentName()
      let id: types.Id

      return postRandomNote()
        .then((resp) => {
          id = resp.id
          return postStandardFile(id, fileName)
        })
        .then(() => api.readFile(id, fileName))
        .then((data) => {
          expect(fileBuffer.equals(data)).to.be.true
        })
    })

    it('should handle url encoded file name', () => {
      const fileName = `some prefix with spaces ${genAttachmentName()}`
      let id: types.Id

      return postRandomNote()
        .then((resp) => {
          id = resp.id
          return postStandardFile(id, fileName)
        })
        .then(() => api.readFile(id, fileName))
        .then((data) => {
          expect(fileBuffer.equals(data)).to.be.true
        })
    })

    it('should fail if trying to get file from non-existing record', () => {
      return expectFailure(api.readFile(randomInt(), genAttachmentName()), 404)
    })

    it('should fail if trying to get non-existing file', () => {
      return expectFailure(
        postRandomNote()
          .then((resp) => api.readFile(resp.id, genAttachmentName())),
        404
      )
    })
  })

  describe('deleteFile()', () => {
    it('should delete attached file', () => {
      const fileName = genAttachmentName()
      let id: types.Id

      return postRandomNote()
        .then((resp) => {
          id = resp.id
          return postStandardFile(id, fileName)
        })
        .then(() => api.deleteFile(id, fileName))
        .then(() => expectFailure(api.readFile(id, fileName), 404))
    })

    it('should fail if trying to delete non-existing file', () => {
      return expectFailure(
        postRandomNote()
          .then((resp) => api.deleteFile(resp.id, genAttachmentName())),
        404
      )
    })
  })
})
