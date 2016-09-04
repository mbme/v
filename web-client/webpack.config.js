const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const postcssMixins = require('postcss-mixins');
const postcssNested = require('postcss-nested');
const postcssSimpleVars = require('postcss-simple-vars');
const postcssVerticalRhythm = require('postcss-vertical-rhythm');
const postcssAutoprefixer = require('autoprefixer');

const isProdMode = process.env.NODE_ENV === 'production';
const NODE_ENV = JSON.stringify(isProdMode ? 'production' : 'development');

// App files location
const PATHS = {
  src: path.resolve(__dirname, './src'),
  app: path.resolve(__dirname, './src/app'),
  styles: path.resolve(__dirname, './src/styles'),
  build: path.resolve(__dirname, './build'),
};

const config = {
  env: NODE_ENV,
  entry: {
    app: path.resolve(PATHS.app, 'main.tsx'),
    vendor: ['react', 'react-dom', 'mobx', 'mobx-react'],
  },
  output: {
    path: PATHS.build,
    filename: 'app/[name].js',
    publicPath: '/',
  },
  stats: {
    colors: true,
    reasons: true,
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx'],
    root: [PATHS.app],
  },
  module: {
    preLoaders: [
      {
        test: /\.tsx?$/,
        loader: "tslint"
      }
    ],
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        include: PATHS.app,
      },
      { // CSS
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      { // FONTS
        test: /\.woff|\.woff2/,
        loader: 'url-loader?limit=100000'
      },
    ],
  },
  tslint: {
    emitErrors: true,
  },
  postcss: function (webpack) {
    return [
      postcssMixins,
      postcssNested,
      postcssSimpleVars(),
      postcssVerticalRhythm(),
      postcssAutoprefixer({ browsers: ['last 2 versions'] }),
    ];
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'app/vendor.bundle.js'),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': NODE_ENV,
      __DEV__: JSON.stringify(!isProdMode),
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
  ],
};

if (isProdMode) {
  config.plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false,
        screw_ie8: true,
      },
    })
  );
} else {
  config.devServer = {
    contentBase: PATHS.src,
    port: 8080,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://' + require('../server/config.json').server_address,
        pathRewrite: {
          '^/api': '',
        },
      },
    }
  };
  config.devtool = 'eval';
}

module.exports = config;
