/* eslint arrow-body-style: 0 */
/* eslint-disable no-unused-expressions, no-return-assign */

const utils = require('./utils');

const request = require('superagent');
const expect = require('chai').expect;

const SERVER_ADDRESS = require('../server/config.json').server_address;

function url(path) {
  return `${SERVER_ADDRESS}${path}`;
}

function expectFailure(promise, status) {
  return promise.then(
    () => {
      throw new Error('must fail');
    },
    (err) => expect(err.status).to.equal(status)
  );
}

function listRecords() {
  return utils.intoPromise(request.get(url('/api/records')));
}

function postNote(note) {
  return utils.intoPromise(
    request.post(url('/api/notes')).send(note)
  );
}

function randomNote() {
  return {
    name: utils.uniq('name'),
    data: utils.uniq('data'),
  };
}

function postRandomNote() {
  return postNote(randomNote());
}

function putNote(id, note) {
  return utils.intoPromise(
    request.put(url(`/api/notes/${id}`)).send(note)
  );
}

function getNote(id) {
  return utils.intoPromise(
    request.get(url(`/api/notes/${id}`))
  );
}

function deleteNote(id) {
  return utils.intoPromise(
    request.delete(url(`/api/notes/${id}`))
  );
}

function validateNote(body, expected) {
  expect(body).to.have.all.keys(
    'id', 'name', 'data', 'create_ts', 'update_ts', 'files'
  );

  expect(body.id).to.be.a('number');
  expect(body.name).to.equal(expected.name);
  expect(body.data).to.equal(expected.data);
  expect(body.files).to.be.an('array');
  expect(body.create_ts).to.be.a('number');
  expect(body.update_ts).to.be.a('number');
}

function validateFileInfo(body, expected) {
  expect(body).to.have.all.keys(
    'name', 'size', 'create_ts'
  );

  expect(body.name).to.equal(expected.name);
  expect(body.size).to.be.a('number');
  expect(body.size).to.be.above(0);
  expect(body.create_ts).to.be.a('number');
}

describe('GET /records', () => {
  it('should return an array', () => {
    return listRecords().then(
      ({ body }) => {
        expect(body).to.be.an('array');
      }
    );
  });
});

describe('POST /api/notes', () => {
  it('should create new note', () => {
    const note = randomNote();

    return postNote(note).then(({ body }) => {
      expect(body).to.be.an('object');

      validateNote(body, note);

      return listRecords();
    }).then(({ body }) => { // check if new note is searchable
      expect(body.filter(rec => rec.name === note.name)).to.have.lengthOf(1);
    });
  });
});

describe('GET /api/notes/:id', () => {
  it('should return existing note', () => {
    const note = randomNote();

    let noteId;

    return postNote(note).then(({ body }) => {
      noteId = body.id;

      return getNote(noteId);
    }).then(({ body }) => {
      expect(body).to.be.an('object');

      validateNote(body, note);
      expect(body.id).to.equal(noteId);
    });
  });

  it('should return 404 NOT FOUND for non-existing note', () => {
    return expectFailure(getNote(utils.randomInt()), 404);
  });

  it('should return 400 BAD REQUEST for invalid ids', () => {
    return expectFailure(getNote('some-invalid-id'), 400);
  });
});

describe('PUT /api/notes/:id', () => {
  it('should update note', () => {
    const note = randomNote();
    const note1 = randomNote();

    let id;
    return postNote(note)
      .then(({ body }) => {
        expect(body).to.be.an('object');

        id = body.id;

        // update note
        return putNote(id, note1);
      })
      .then(() => getNote(id))
      .then(({ body }) => {
        validateNote(body, note1);
        expect(body.id).to.equal(id);
      });
  });

  it('should fail if trying to update non-existing note', () => {
    const note = randomNote();

    return expectFailure(putNote(utils.randomInt(), note), 404);
  });
});

describe('DELETE /api/notes/:id', () => {
  it('should remove note', () => {
    const note = randomNote();

    let id;
    return expectFailure(
      postNote(note)
        .then(({ body }) => {
          id = body.id;

          validateNote(body, note);

          return deleteNote(id);
        })
        .then(() => getNote(id)),
      404
    );
  });

  it('should fail if trying to delete non-existing note', () => {
    return expectFailure(deleteNote(utils.randomInt()), 404);
  });
});

// ************* FILES

const attachmentPath = './data/city-view.jpg';
function genAttachmentName() {
  const name = utils.uniq('attachment');
  return `${name}.jpg`;
}

function postFile(noteId, path, name) {
  return utils.intoPromise(
    request.post(url(`/api/notes/${noteId}/files`))
      .field('name', name)
      .attach('data', path)
  );
}

function postStandardFile(noteId, name) {
  return postFile(noteId, attachmentPath, name);
}

function getNoteFiles(id) {
  return utils.intoPromise(
    request.get(url(`/api/notes/${id}/files`))
  );
}

function getFile(noteId, name) {
  return utils.intoPromise(
    request.get(url(`/api/notes/${noteId}/files/${name}`))
  );
}

function deleteFile(noteId, name) {
  return utils.intoPromise(
    request.delete(url(`/api/notes/${noteId}/files/${name}`))
  );
}

describe('POST /api/notes/:id/files', () => {
  it('should create new file', () => {
    const fileName = genAttachmentName();

    return postRandomNote()
      .then(({ body }) => postStandardFile(body.id, fileName))
      .then(({ body }) => {
        validateFileInfo(body, {
          name: fileName,
        });
      });
  });

  it('should fail if trying to add file to non-existing note', () => {
    return expectFailure(postStandardFile(utils.randomInt(), genAttachmentName()), 500);
  });
});

describe('GET /api/notes/:id/files/:name', () => {
  it('should return file content', () => {
    const fileName = genAttachmentName();
    let id;

    return postRandomNote()
      .then(({ body }) => {
        id = body.id;
        return postStandardFile(id, fileName);
      })
      .then(() => getFile(id, fileName))
      .then((response) => {
        const data = response.body;
        const expectedData = utils.readBinaryFile(attachmentPath);
        expect(expectedData.equals(data)).to.be.true;
      });
  });

  it('should fail if trying to get file from non-existing note', () => {
    return expectFailure(getFile(utils.randomInt(), genAttachmentName()), 404);
  });

  it('should fail if trying to get non-existing file', () => {
    return expectFailure(
      postRandomNote()
        .then(({ body }) => getFile(body.id, genAttachmentName())),
      404
    );
  });
});

describe('GET /api/notes/:id/files', () => {
  it('should return all note files', () => {
    let noteId;
    return postRandomNote().then(({ body }) => noteId = body.id)
      .then(() => postStandardFile(noteId, genAttachmentName()))
      .then(() => postStandardFile(noteId, genAttachmentName()))
      .then(() => Promise.all([getNote(noteId), getNoteFiles(noteId)]))
      .then((results) => {
        const noteFiles = results[0].body.files;
        const files = results[1].body;
        expect(files).to.deep.equal(noteFiles);
      });
  });

  it('should return 404 NOT FOUND for non-existing note', () => {
    return expectFailure(getNoteFiles(utils.randomInt()), 404);
  });

  it('should return 400 BAD REQUEST for invalid ids', () => {
    return expectFailure(getNoteFiles('some-invalid-id'), 400);
  });
});


describe('DELETE /api/notes/:id/files/:name', () => {
  it('should delete attached file', () => {
    const fileName = genAttachmentName();
    let id;

    return postRandomNote()
      .then(({ body }) => {
        id = body.id;
        return postStandardFile(id, fileName);
      })
      .then(() => deleteFile(id, fileName))
      .then(() => expectFailure(getFile(id, fileName), 404));
  });

  it('should fail if trying to delete non-existing file', () => {
    return expectFailure(
      postRandomNote()
        .then(({ body }) => deleteFile(body.id, genAttachmentName())),
      404
    );
  });
});
