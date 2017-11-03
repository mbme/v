#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */

require('babel-register')

global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production'

global.fetch = require('node-fetch')
global.FormData = require('form-data')

const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfig = require('../webpack.config')
const startServer = require('../server').default
const createApiClient = require('../shared/api').default
const { createTextGenerator } = require('../shared/random')
const { createArray } = require('../shared/utils')

const port = 8080
const devServerPort = 8000

const server = new WebpackDevServer(webpack(webpackConfig), {
  hot: true,
  historyApiFallback: true,
  contentBase: [ path.join(__dirname, '../static') ],
  proxy: {
    '/api': `http://localhost:${port}`,
  },
})

startServer(port).then(() => {
  const text = fs.readFileSync(path.join(__dirname, '../shared/text.txt'), 'utf-8')
  const generator = createTextGenerator(text)
  const api = createApiClient(`http://localhost:${port}`)

  const promises = createArray(
    23,
    () => {
      const name = generator.generateSentence(1, 8)
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

  server.listen(devServerPort, 'localhost', () => {
    console.log(`Webpack Dev Server http://localhost:${devServerPort}`)
  })
})
