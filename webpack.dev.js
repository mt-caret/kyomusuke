const path = require('path');
const Merge = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = Merge(CommonConfig, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
//  module: {
//    rules: [
//      {
//        test: /\.elm$/,
//        exclude: [/elm-stuff/, /node_modules/],
//        use: {
//          loader: 'elm-webpack-loader',
//          options: {
//            debug: true,
//          }
//        },
//      },
//    ]
//  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    publicPath: '/',
  },
});
