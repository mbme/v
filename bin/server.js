#!/usr/bin/env node

require('babel-register')

global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production'

const port = 8080
require('../server').default(port).then(() => {
  console.log(`Server listening on http://localhost:${port}`)
})
