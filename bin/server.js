#!/usr/bin/env node

/* eslint-disable global-require */

require('babel-register')({
  plugins: ['transform-es2015-modules-commonjs'],
})


const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

const startServer = require('../server').default

startServer(8080, isDevelopment).then(() => {
  if (!isDevelopment) {
    return
  }

  global.fetch = require('node-fetch')
  const createApiClient = require('../client/utils/api').default

  const api = createApiClient('http://localhost:8080')

  const promises = Array(23).fill(0).map(
    (_, i) => api.createRecord('note', `Note #${i}`, 'Some very random data')
  )

  Promise.all(promises).then(
    () => console.log('Generated %s fake records', promises.length),
    (err) => {
      console.log('Failed to generate fake records:')
      console.log(err)
    }
  )
})
