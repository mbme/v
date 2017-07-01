require('babel-register')({
  plugins: ['transform-es2015-modules-commonjs'],
})

const startServer = require('../server').default

startServer(8080, true)
