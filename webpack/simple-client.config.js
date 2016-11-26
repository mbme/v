const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const {
  postcssConfig,
  PATHS,
  LOADERS,
  getCurrentCommitHash,
  baseConfig,
  isDevMode,
  isProdMode,
} = require('./parts')

const config = baseConfig

config.entry = path.resolve(PATHS.simpleClient, 'index.js')
config.output = {
  filename: 'app.js',
  publicPath: '/',
  path: path.resolve(PATHS.build, 'app'),
}
config.module.loaders = [
  {
    test: /\.tsx?$/,
    loader: 'ts-loader',
  },
  LOADERS.styles,
  LOADERS.fonts,
]
config.postcss = postcssConfig
config.plugins.push(
  new HtmlWebpackPlugin({ template: 'simple-client/index.html' })
)

if (isDevMode) {
  config.plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: 'true',
      __SERVER__: '""',
    })
  )

  config.devServer = {
    stats: 'minimal',
    contentBase: PATHS.root,
    port: 8080,
    historyApiFallback: true,
  }
  config.devtool = 'eval'

} else if (isProdMode) {
  config.ts = {
    compilerOptions: {
      sourceMap: true,
    },
  }
  config.plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
      },
      output: {
        comments: false,
      },
    })
  )
  config.devtool = 'source-map'

  // Write last git commit id to the file
  fs.writeFileSync(path.resolve(PATHS.build, 'VERSION'), getCurrentCommitHash())

} else {
  throw new Error('unknown mode')
}


module.exports = config
