const path = require('path')
const webpack = require('webpack')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    './client/index.jsx',
  ],

  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    extensions: [ '.js', '.jsx', '.json' ],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'react-hot-loader/webpack',
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              babelrc: false,
              presets: [
                [
                  'env',
                  {
                    targets: {
                      browsers: [ 'last 2 Chrome versions', 'last 2 Firefox versions' ],
                      uglify: isProduction,
                    },
                    modules: false,
                  },
                ],
              ],
              plugins: [
                'transform-object-rest-spread',
                'transform-class-properties',
                'syntax-jsx',
                'transform-react-jsx',
                [ 'module-resolver', { root: [ '.' ] } ],
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        loader: 'raw-loader',
      },
    ],
  },

  plugins: [
    isProduction && new webpack.optimize.ModuleConcatenationPlugin(),
    isProduction && new webpack.optimize.UglifyJsPlugin(),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ].filter(plugin => !!plugin),

  devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
}
