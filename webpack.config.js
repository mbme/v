const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { postcssConfig, PATHS, LOADERS, getCurrentCommitHash } = require('./webpack/parts')

const isProdMode = process.env.NODE_ENV === 'production'
const NODE_ENV = JSON.stringify(isProdMode ? 'production' : 'development')

const config = {
  env: NODE_ENV,
  output: {
    filename: 'app.js',
    publicPath: '/',
  },
  stats: {
    colors: true,
    reasons: true,
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx'],
    root: [PATHS.root],
  },
  module: {
    preLoaders: [
      LOADERS.tslint,
    ],
    loaders: [
      LOADERS.ts,
      LOADERS.styles,
      LOADERS.fonts,
    ],
  },
  postcss: postcssConfig,
  plugins: [
    new HtmlWebpackPlugin({ template: 'web-client/index.html' }),
    // do not load moment locales
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': NODE_ENV,
    }),
  ],
}

if (isProdMode) {
  config.entry = path.resolve(PATHS.webClient, 'index.js'),
  config.output.path = PATHS.prod_build
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
  config.ts = {
    compilerOptions: {
      sourceMap: true,
    },
  }

  // Write last git commit id to the file
  fs.writeFileSync(path.resolve(PATHS.prod_build, 'VERSION'), getCurrentCommitHash())

} else {
  config.entry = path.resolve(PATHS.webClient, 'index.js'),
  config.output.path = PATHS.build
  config.plugins.push(
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      __DEV__: '"true"',
    })
  )
  config.devServer = {
    contentBase: PATHS.root,
    port: 8080,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://' + require('./server/config.json').server_address,
      },
    },
  }
  config.devtool = 'eval'
}

module.exports = config
