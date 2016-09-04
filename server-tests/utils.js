const fs = require('fs');

function randomInt() {
  return Math.floor(Math.random() * 999999999999999);
}

// add uniq suffix to string
function uniq(str) {
  return `${str}_${randomInt()}`;
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

function readBinaryFile(name) {
  return fs.readFileSync(name);
}

module.exports = {
  uniq, intoPromise, randomInt, readBinaryFile,
};