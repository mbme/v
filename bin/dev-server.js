#!/usr/bin/env node

require('babel-register')

global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production'

const startServer = require('../server').default
const genData = require('./gen-data')

const port = 8080

startServer(port).then(() => {
  console.log(`api server http://localhost:${port}`)
  return genData(port, 30)
})
