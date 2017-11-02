const path = require('path')
const webpack = require('webpack')

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
                    targets: { browsers: [ 'last 2 Chrome versions', 'last 2 Firefox versions' ] },
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
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    port: 8000,
    hot: true,
  },
}
