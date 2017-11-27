import path from 'path'
import webpack from 'webpack'
import MinifyPlugin from 'babel-minify-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  entry: './client/index.jsx',

  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    extensions: [ '.js', '.jsx', '.json' ],
    modules: [
      path.resolve(__dirname), // equal to NODE_PATH=.
      'node_modules',
    ],
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

    !isProduction && new webpack.NoEmitOnErrorsPlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      '__CLIENT__': 'true',
    }),
  ].filter(plugin => !!plugin),

  devtool: isProduction ? 'source-map' : 'cheap-module-eval-source-map',
}
