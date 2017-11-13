import path from 'path'
import webpack from 'webpack'
import MinifyPlugin from 'babel-minify-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: [
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
    modules: [ path.resolve(__dirname), 'node_modules' ],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            plugins: [
              'react-hot-loader/babel',
              'transform-object-rest-spread',
              'transform-class-properties',
              'syntax-jsx',
              'transform-react-jsx',
            ],
          },
        },
      },
    ],
  },

  plugins: [
    isProduction && new webpack.optimize.ModuleConcatenationPlugin(),
    isProduction && new MinifyPlugin(),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      '__CLIENT__': 'true',
    }),
  ].filter(plugin => !!plugin),

  devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',

  devServer: {
    hot: true,
    port: 8000,
    historyApiFallback: true,
    contentBase: [ path.join(__dirname, './static') ],
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
}
