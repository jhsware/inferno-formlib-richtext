const path = require('path')

module.exports = {
  entry: {
    app: path.resolve(__dirname, './src/app.js')
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: ['babel-loader']
    }]
  }
}

