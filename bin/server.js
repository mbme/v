require('babel-register')

const startServer = require('../server').default

startServer(8080, true)
