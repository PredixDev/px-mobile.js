var path = require('path');
module.exports = {
  libraryTarget: 'umd',
  umdNamedDefine: 'pxMobile',
  loaders: [
    {
     test: /\.jsx?$/,
     exclude: /(node_modules|bower_components)/,
     // Skip any files outside of your project's `src` directory

     // "include" is commonly used to match the directories
    include: [
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "test")
    ],
     // Options to configure babel with
     query: {
       cacheDirectory: true,
       plugins: ['transform-runtime'],
       presets: ['es2015', 'stage-0'],
     },
     loader: 'babel-loader' // 'babel-loader' is also a legal name to reference
   }],
  entry: [
    // Set up an ES6-ish environment
    'babel-polyfill',

    // Add your application's scripts below
    './src/index',
  ],
  output: {
      path: __dirname,
      filename: 'dist/bundle.js'
  }

}
