const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './client/index.js',
  output: {
    path: 'dist',
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'QuantumV',
    }),
  ],
}
