require('babel-register')({
  plugins: ['transform-es2015-modules-commonjs'],
})

global.fetch = require('node-fetch')
const createApiClient = require('../client/utils/api').default


// TODO use Markov chain

const api = createApiClient('http://localhost:8080')

const promises = Array(23).fill(0).map(
  (_, i) => api.createRecord('note', `Note #${i}`, 'Some very random data')
)

Promise.all(promises).then(
  (result) => {
    console.log('SUCCESS')
    console.log(result)
  },
  (err) => {
    console.log('FAILURE')
    console.log(err)
  }
)
