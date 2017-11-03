#!/usr/bin/env node

require('babel-register')

global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production'

require('../server').default(8080)
