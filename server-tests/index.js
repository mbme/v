/* eslint arrow-body-style: 0 */

const request = require('superagent');
const expect = require('chai').expect;

function url(path) {
  return `http://127.0.0.1:8080${path}`;
}

function intoPromise(req) {
  return new Promise((resolve, reject) => {
    req.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
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
  return intoPromise(request.get(url('/records')));
}

function postNote(note) {
  return intoPromise(
    request.post(url('/notes')).send(note)
  );
}

function putNote(id, note) {
  return intoPromise(
    request.put(url(`/notes/${id}`)).send(note)
  );
}

function getNote(id) {
  return intoPromise(
    request.get(url(`/notes/${id}`))
  );
}

function deleteNote(id) {
  return intoPromise(
    request.delete(url(`/notes/${id}`))
  );
}

function randomInt() {
  return Math.floor(Math.random() * 999999999999999);
}

// add uniq suffix to string
function uniq(str) {
  return `${str}_${randomInt()}`;
}

function arr2obj(arr) {
  const result = {};

  arr.forEach((val) => {
    result[val] = true;
  });

  return result;
}

function validateNote(body, expected) {
  expect(body).to.have.all.keys(
    'id', 'name', 'data', 'create_ts', 'update_ts'
  );

  expect(body.id).to.be.a('number');
  expect(body.name).to.equal(expected.name);
  expect(body.data).to.equal(expected.data);
  expect(body.create_ts).to.be.a('number');
  expect(body.update_ts).to.be.a('number');
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

describe('POST /notes', () => {
  it('should create new note', () => {
    const note = {
      name: uniq('name'),
      data: '',
    };

    return postNote(note).then(({ body }) => {
      expect(body).to.be.an('object');

      validateNote(body, note);

      return listRecords();
    }).then(({ body }) => { // check if new note is searchable
      expect(body.filter(rec => rec.name === note.name)).to.have.lengthOf(1);
    });
  });
});

describe('GET /notes/:id', () => {
  it('should return existing note', () => {
    const note = {
      name: uniq('name'),
      data: 'some data',
    };
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
    return expectFailure(getNote(randomInt()), 404);
  });

  it('should return 400 BAD REQUEST for invalid ids', () => {
    return expectFailure(getNote('some-invalid-id'), 400);
  });
});

describe('PUT /notes/:id', () => {
  it('should update note', () => {
    const note = {
      name: uniq('name'),
      data: '123',
    };

    const note1 = {
      name: uniq('name'),
      data: 'other data',
    };

    let id;
    return postNote(note)
      .then(({ body }) => {
        expect(body).to.be.an('object');

        id = body.id;

        validateNote(body, note);

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
    const note = {
      name: uniq('name'),
      data: '123',
    };

    return expectFailure(putNote(randomInt(), note), 404);
  });
});

describe('DELETE /notes/:id', () => {
  it('should remove note', () => {
    const note = {
      name: uniq('name'),
      data: '123',
    };

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
    return expectFailure(deleteNote(randomInt()), 404);
  });
});

// ************* FILES

function listFiles() {
  return intoPromise(request.get(url('/files')));
}

const attachmentPath = './data/city-view.jpg';
function genAttachmentName() {
  return `${uniq('attachment')}.jpg`;
}

function postFile(path, name) {
  return intoPromise(
    request.post(url('/files'))
      .field('name', name)
      .attach('data', path)
  );
}

describe('GET /files', () => {
  it('should return an array', () => {
    return listFiles().then(
      ({ body }) => {
        expect(body).to.be.an('array');
      }
    );
  });
});

describe('POST /files', () => {
  it('should create new file', () => {
    const fileName = genAttachmentName();
    return postFile(attachmentPath, fileName).then(({ body }) => {
      expect(body).to.be.an('object');

      expect(body).to.have.all.keys(
        'id', 'name', 'size', 'create_ts', 'update_ts'
      );

      expect(body.id).to.be.a('number');
      expect(body.size).to.be.a('number');
      expect(body.create_ts).to.be.a('number');
      expect(body.update_ts).to.be.a('number');
      expect(body.name).to.equal(fileName);

      return listRecords();
    }).then(({ body }) => {
      expect(body.filter(file => file.name === fileName)).to.have.lengthOf(1);
    });
  });
});

describe('GET /files/:id', () => {
});

describe('DELETE /files/:id', () => {
});
