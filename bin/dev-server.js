#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */

require('babel-register')

global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production'

const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfig = require('../webpack.config')
const startServer = require('../server').default
const genData = require('./gen-data')

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
  genData(port, 30)

  server.listen(devServerPort, 'localhost', () => {
    console.log(`api server http://localhost:${port}`)
    console.log(`Webpack Dev Server http://localhost:${devServerPort}`)
  })
})
