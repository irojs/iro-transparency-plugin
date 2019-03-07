const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';
const devserver = process.env.DEV_SERVER || false;

module.exports = {
  mode,
  context: path.resolve(__dirname, 'src'),
  entry: [
    './index.js',
    devserver ? './test.js' : false,
  ].filter(Boolean),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: prod ? 'iro-transparency-plugin.min.js' : 'iro-transparency-plugin.js',
    library: 'iroTransparencyPlugin',
    libraryExport: 'default',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    // for some reason webpack 4's umd implementation uses window as a global object
    // this means that these modules won't work in node js environments unless you manually change this
    // see https://github.com/webpack/webpack/issues/6522#issuecomment-371120689
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
            plugins: [
              ['@babel/plugin-transform-react-jsx', {pragma: 'h'}]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: [
        'iro-transparency-plugin v' + pkg.version,
        pkg.description,
        '2019 James Daniel',
        'Licensed under MPL 2.0',
        'github.com/jaames/iro-transparency-plugin',
      ].join('\n')
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(pkg.version),
      IS_PROD: prod,
      IS_DEV_SERVER: devserver,
    }),
    devserver ? new HtmlWebpackPlugin() : false
  ].filter(Boolean),
  devtool: 'source-map',
};