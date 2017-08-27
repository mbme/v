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
  const fs = require('fs')
  const path = require('path')
  const createApiClient = require('../shared/api').default
  const text = fs.readFileSync(path.join(__dirname, '../shared/text.txt'), 'utf-8')
  const { createTextGenerator } = require('../shared/random')
  const { createArray } = require('../shared/utils')

  const generator = createTextGenerator(text)

  const api = createApiClient('http://localhost:8080')

  const promises = createArray(
    23,
    () => {
      const name = generator.generateSentence()
      const data = generator.generateText()
      return api.createRecord('note', name.substring(0, name.length - 1), data)
    }
  )

  Promise.all(promises).then(
    () => console.log('Generated %s fake records', promises.length),
    (err) => {
      console.log('Failed to generate fake records:')
      console.log(err)
    }
  )
})
