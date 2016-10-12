const path = require('path')
const webpack = require('webpack')

const {
  PATHS,
  baseConfig,
  LOADERS,
} = require('./parts')

const { server_address } = require(PATHS.fromRoot('./server/config.json'))

const config = baseConfig

config.entry = path.resolve(PATHS.apiTests, 'index.ts'),
config.output = {
  filename: 'tests.js',
  publicPath: '/',
  path: path.resolve(PATHS.build, 'tests'),
}

config.target = 'node'

config.module.loaders.push(
  LOADERS.json
)

config.plugins.push(
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    __DEV__: '"true"',
    __SERVER__: `"http://${server_address}"`,
    'global.GENTLY': false, // fixes warnings from formidable(superagent) https://github.com/felixge/node-formidable/issues/295
  })
)

module.exports = config
