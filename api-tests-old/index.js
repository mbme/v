/* eslint arrow-body-style: 0 */
/* eslint-disable no-unused-expressions, no-return-assign */

const utils = require('./utils')

const request = require('superagent')
const expect = require('chai').expect

const SERVER_ADDRESS = require('../server/config.json').server_address

function url(path) {
  return `${SERVER_ADDRESS}${path}`
}

function expectFailure(promise, status) {
  return promise.then(
    () => {
      throw new Error('must fail')
    },
    (err) => {
      expect(err.status).to.equal(status)

      const body = err.response.body
      expect(body).to.have.all.keys('error')
      expect(body.error).to.be.a('string')
    }
  )
}

function postNote(note) {
  return utils.intoPromise(
    request.post(url('/api/notes')).send(note)
  )
}

function randomNote() {
  return {
    name: utils.uniq('name'),
    data: utils.uniq('data'),
  }
}

function postRandomNote() {
  return postNote(randomNote())
}

function getNote(id) {
  return utils.intoPromise(
    request.get(url(`/api/notes/${id}`))
  )
}

function validateFileInfo(body, expected) {
  expect(body).to.have.all.keys(
    'name', 'size', 'create_ts'
  )

  expect(body.name).to.equal(expected.name)
  expect(body.size).to.be.a('number')
  expect(body.size).to.be.above(0)
  expect(body.create_ts).to.be.a('number')
}

// ************* FILES

const attachmentPath = './data/city-view.jpg'
function genAttachmentName() {
  const name = utils.uniq('attachment')
  return `${name}.jpg`
}

function postFile(noteId, path, name) {
  return utils.intoPromise(
    request.post(url(`/api/notes/${noteId}/files`))
      .field('name', name)
      .attach('data', path)
  )
}

function postStandardFile(noteId, name) {
  return postFile(noteId, attachmentPath, name)
}

function getNoteFiles(id) {
  return utils.intoPromise(
    request.get(url(`/api/notes/${id}/files`))
  )
}

function getFile(noteId, name) {
  return utils.intoPromise(
    request.get(url(`/api/notes/${noteId}/files/${name}`))
  )
}

function deleteFile(noteId, name) {
  return utils.intoPromise(
    request.delete(url(`/api/notes/${noteId}/files/${name}`))
  )
}

describe('POST /api/notes/:id/files', () => {
  it('should create new file', () => {
    const fileName = genAttachmentName()

    return postRandomNote()
      .then(({ body }) => postStandardFile(body.id, fileName))
      .then(({ body }) => {
        validateFileInfo(body, {
          name: fileName,
        })
      })
  })

  it('should fail if trying to add file to non-existing note', () => {
    return expectFailure(postStandardFile(utils.randomInt(), genAttachmentName()), 500)
  })
})

describe('GET /api/notes/:id/files/:name', () => {
  it('should return file content', () => {
    const fileName = genAttachmentName()
    let id

    return postRandomNote()
      .then(({ body }) => {
        id = body.id
        return postStandardFile(id, fileName)
      })
      .then(() => getFile(id, fileName))
      .then((response) => {
        const data = response.body
        const expectedData = utils.readBinaryFile(attachmentPath)
        expect(expectedData.equals(data)).to.be.true
      })
  })

  it('should handle url encoded file name', () => {
    const fileName = `some prefix with spaces ${genAttachmentName()}`
    let id

    return postRandomNote()
      .then(({ body }) => {
        id = body.id
        return postStandardFile(id, fileName)
      })
      .then(() => getFile(id, fileName))
      .then((response) => {
        const data = response.body
        const expectedData = utils.readBinaryFile(attachmentPath)
        expect(expectedData.equals(data)).to.be.true
      })
  })

  it('should fail if trying to get file from non-existing note', () => {
    return expectFailure(getFile(utils.randomInt(), genAttachmentName()), 404)
  })

  it('should fail if trying to get non-existing file', () => {
    return expectFailure(
      postRandomNote()
        .then(({ body }) => getFile(body.id, genAttachmentName())),
      404
    )
  })
})

describe('GET /api/notes/:id/files', () => {
  it('should return all note files', () => {
    let noteId
    return postRandomNote().then(({ body }) => noteId = body.id)
      .then(() => postStandardFile(noteId, genAttachmentName()))
      .then(() => postStandardFile(noteId, genAttachmentName()))
      .then(() => Promise.all([getNote(noteId), getNoteFiles(noteId)]))
      .then((results) => {
        const noteFiles = results[0].body.files
        const files = results[1].body
        expect(files).to.deep.equal(noteFiles)
      })
  })

  it('should return 404 NOT FOUND for non-existing note', () => {
    return expectFailure(getNoteFiles(utils.randomInt()), 404)
  })

  it('should return 400 BAD REQUEST for invalid ids', () => {
    return expectFailure(getNoteFiles('some-invalid-id'), 400)
  })
})


describe('DELETE /api/notes/:id/files/:name', () => {
  it('should delete attached file', () => {
    const fileName = genAttachmentName()
    let id

    return postRandomNote()
      .then(({ body }) => {
        id = body.id
        return postStandardFile(id, fileName)
      })
      .then(() => deleteFile(id, fileName))
      .then(() => expectFailure(getFile(id, fileName), 404))
  })

  it('should fail if trying to delete non-existing file', () => {
    return expectFailure(
      postRandomNote()
        .then(({ body }) => deleteFile(body.id, genAttachmentName())),
      404
    )
  })
})
