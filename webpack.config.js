const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './distsrc/index.js'],
  target: "node",
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'resize.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
  mode: "production",
  externals: {
    "sharp": "commonjs sharp",
    "fsevents": "commonjs fsevents",
  }
};