import { expect } from 'chai'
import {
  uniq,
  randomInt,
  expectFailure,
  readBinaryFile,
} from './utils'
import * as api from 'api-client'
import * as types from 'api-client/types'

const fileBuffer = readBinaryFile('./api-tests/data/city-view.jpg')

function postStandardFile(recordId: types.Id, name: string): Promise<types.IFileInfo> {
  return api.uploadFile(recordId, name, fileBuffer)
}

function postRandomNote(): Promise<types.INote> {
  return api.createNote(uniq('name'), uniq('data'))
}

function validateFileInfo(body: types.IFileInfo, name: string, size: number): void {
  expect(body).to.have.all.keys(
    'name', 'size', 'create_ts'
  )

  expect(body.name).to.equal(name)
  expect(body.size).to.be.a('number')
  expect(body.size).to.equal(size)
  expect(body.create_ts).to.be.a('number')
}

function genAttachmentName(): string {
  const name = uniq('attachment')
  return `${name}.jpg`
}

describe('Files API', () => {

  describe('listFiles()', () => {
    it('should return all files attached to the record', async () => {
      const { id } = await postRandomNote()

      await postStandardFile(id, genAttachmentName())
      await postStandardFile(id, genAttachmentName())

      const note = await api.readNote(id)
      const files = await api.listFiles(id)
      expect(files).to.deep.equal(note.files)
    })

    it('should return 404 NOT FOUND for non-existing record', async () => {
      await expectFailure(api.listFiles(randomInt()), 404)
    })

    it('should return 400 BAD REQUEST for invalid ids', async () => {
      await expectFailure(
        api.listFiles('some-invalid-id' as any),  // tslint:disable-line:no-any
        400
      )
    })
  })

  describe('uploadFile()', () => {
    it('should create new file', async () => {
      const fileName = genAttachmentName()

      const { id } = await postRandomNote()
      const file = await postStandardFile(id, fileName)

      validateFileInfo(file, fileName, fileBuffer.length)
    })

    it('should fail if trying to add file to non-existing record', async () => {
      await expectFailure(postStandardFile(randomInt(), genAttachmentName()), 404)
    })
  })

  describe('readFile()', () => {
    it('should return file content', async () => {
      const fileName = genAttachmentName()

      const { id } = await postRandomNote()
      await postStandardFile(id, fileName)

      const data = await api.readFile(id, fileName)
      expect(fileBuffer.equals(data)).to.be.true
    })

    it('should handle url encoded file name', async () => {
      const fileName = `some prefix with spaces ${genAttachmentName()}`

      const { id } = await postRandomNote()
      await postStandardFile(id, fileName)

      const data = await api.readFile(id, fileName)
      expect(fileBuffer.equals(data)).to.be.true
    })

    it('should fail if trying to get file from non-existing record', async () => {
      await expectFailure(api.readFile(randomInt(), genAttachmentName()), 404)
    })

    it('should fail if trying to get non-existing file', async () => {
      await expectFailure(
        postRandomNote()
          .then((resp) => api.readFile(resp.id, genAttachmentName())),
        404
      )
    })
  })

  describe('deleteFile()', () => {
    it('should delete attached file', async () => {
      const fileName = genAttachmentName()

      const { id } = await postRandomNote()
      await postStandardFile(id, fileName)

      await api.deleteFile(id, fileName)
      await expectFailure(api.readFile(id, fileName), 404)
    })

    it('should fail if trying to delete non-existing file', async () => {
      await expectFailure(
        postRandomNote()
          .then((resp) => api.deleteFile(resp.id, genAttachmentName())),
        404
      )
    })
  })
})
