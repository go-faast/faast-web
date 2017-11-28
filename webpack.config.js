var webpack = require('webpack')
var path = require('path')
var OpenBrowserPlugin = require('open-browser-webpack-plugin')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')

var WEBPACK_PORT = process.env.WEBPACK_PORT

var config = {
  entry: path.join(__dirname, 'src', 'index.jsx'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'portfolio.bundle.js',
    publicPath: 'http://localhost:' + WEBPACK_PORT
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /(\.css|\.scss)$/,
      oneOf: [
        {
          resourceQuery: /nsm/,
          use: ['style-loader', 'css-loader', 'sass-loader']
        },
        {
          loader: 'style-loader!css-loader?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader?sourceMap'
        }
      ]
    }]
  },
  resolve: {
    alias: {
      Config: path.resolve(__dirname, 'src', 'config'),
      Utilities: path.resolve(__dirname, 'src', 'utilities'),
      Components: path.resolve(__dirname, 'src', 'components'),
      Controllers: path.resolve(__dirname, 'src', 'app', 'controllers'),
      Views: path.resolve(__dirname, 'src', 'app', 'views'),
      Styles: path.resolve(__dirname, 'src', 'app', 'styles'),
      Actions: path.resolve(__dirname, 'src', 'app', 'actions')
    },
    extensions: ['.js', '.jsx', '.json']
  }
}

if (process.env.NODE_ENV === 'production') {
  config.devtool = 'source-map'
  config.plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      uglifyOptions: {
        mangle: {
          reserved: ['BigInteger', 'ECPair', 'Point']
        }
      }
    })
  ]
} else {
  config.devtool = 'eval-source-map'
  config.devServer = {
    compress: true,
    historyApiFallback: true,
    inline: true
  }
  config.plugins = [
    new OpenBrowserPlugin({ url: 'http://localhost:5000/?dev=true' }),
    new webpack.DefinePlugin({
      SITE_URL: JSON.stringify(process.env.SITE_URL)
    })
  ]
}

module.exports = config
