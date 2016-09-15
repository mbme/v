const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

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
  build: path.resolve(__dirname, './build/'),
  prod_build: path.resolve(__dirname, './prod/'),
};

const config = {
  env: NODE_ENV,
  entry: path.resolve(PATHS.app, 'index.js'),
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
  postcss: function (webpack) {
    return [
      postcssMixins,
      postcssNested,
      postcssSimpleVars(),
      postcssVerticalRhythm({ rootSelector: 'html' }),
      postcssAutoprefixer({ browsers: ['last 2 versions'] }),
    ];
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    // do not load moment locales
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': NODE_ENV,
      __DEV__: JSON.stringify(!isProdMode),
    }),
  ],
};

if (isProdMode) {
  config.output.path = PATHS.prod_build;
  config.plugins.push(
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
      },
      output: {
        comments: false
      },
    })
  );
  config.devtool = 'source-map';
  config.ts = {
    compilerOptions: {
      sourceMap: true
    }
  };


  // Write last git commit id to the file
  const VERSION = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
  fs.writeFileSync(path.resolve(PATHS.prod_build, 'VERSION'), VERSION);

} else {
  config.output.path = PATHS.build;
  config.plugins.push(
    new webpack.NoErrorsPlugin()
  );
  config.devServer = {
    contentBase: PATHS.src,
    port: 8080,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://' + require('../server/config.json').server_address,
      },
    }
  };
  config.devtool = 'eval';
}

module.exports = config;
