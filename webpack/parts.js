const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const webpack = require('webpack')

const postcssMixins = require('postcss-mixins')
const postcssNested = require('postcss-nested')
const postcssSimpleVars = require('postcss-simple-vars')
const postcssVerticalRhythm = require('postcss-vertical-rhythm')
const postcssAutoprefixer = require('autoprefixer')

exports.postcssConfig = function () {
  return [
    postcssMixins,
    postcssNested,
    postcssSimpleVars(),
    postcssVerticalRhythm({ rootSelector: 'html' }),
    postcssAutoprefixer({ browsers: ['last 2 versions'] }),
  ]
}

const root = path.resolve(__dirname, '..')

// App files location
const PATHS = {
  root: root,
  webClient: path.resolve(root, './web-client'),
  apiClient: path.resolve(root, './api-client'),
  apiTests: path.resolve(root, './api-tests'),
  build: path.resolve(root, './web-build'),
  fromRoot(relPath) {
    return path.resolve(root, relPath)
  },
}
exports.PATHS = PATHS

const LOADERS = {
  tslint: {
    test: /\.tsx?$/,
    loader: 'tslint',
  },
  ts: {
    test: /\.tsx?$/,
    loader: 'ts-loader',
  },
  json: {
    test: /\.json$/,
    loader: 'json-loader',
  },
  styles: {
    test: /\.css$/,
    loader: 'style-loader!css-loader!postcss-loader',
  },
  fonts: {
    test: /\.woff|\.woff2/,
    loader: 'url-loader?limit=100000',
  },
}
exports.LOADERS = LOADERS

exports.getCurrentCommitHash = function () {
  return childProcess.execSync('git rev-parse --short HEAD').toString().trim()
}

const NODE_ENV = process.env.NODE_ENV || 'development'

exports.isDevMode = NODE_ENV === 'development'
exports.isProdMode = NODE_ENV === 'production'

exports.baseConfig = {
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
  },
  plugins: [
    // do not load moment locales
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
}

// ensure that build dir exists
if (!fs.existsSync(PATHS.build)){
  fs.mkdirSync(PATHS.build)
}
