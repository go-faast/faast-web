const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconPlugin = require('favicons-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const IncludeAssetsPlugin = require('html-webpack-include-assets-plugin')

const pkg = require('../package.json')

const {
  isIpfs, dirs, appPath, bundleOutputPath, vendorOutputPath, faviconOutputPath,
} = require('./common.js')

const getBaseConfig = require('./webpack.config.base.js')

const DEFAULT_NODE_ENV = 'production'
let NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  console.log(`NODE_ENV not specified, using ${DEFAULT_NODE_ENV}`)
  NODE_ENV = DEFAULT_NODE_ENV
}
const isDev = NODE_ENV === 'development'
const publicPath = isIpfs ? './' : '/'

const vendorDeps = ['font-awesome/css/font-awesome.min.css']

const routerBaseName = path.join('/', appPath)
const baseConfig = getBaseConfig(isDev ? 'dev' : 'prod')

let config = merge.strategy({
  'module.rules': 'replace',
})(baseConfig, {
  context: dirs.root,
  entry: ['babel-polyfill', path.join(dirs.app, 'index.jsx')],
  output: {
    filename: path.join(bundleOutputPath, isDev ? '[name].[hash:8].js' : '[name].[chunkHash:8].js'),
    path: dirs.buildApp,
    publicPath: publicPath,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env.ROUTER_BASE_NAME': JSON.stringify(routerBaseName),
      'process.env.IPFS': JSON.stringify(isIpfs),
    }),
    new HtmlPlugin({
      template: path.join(dirs.app, 'index.html'),
      filename: path.join(appPath, 'index.html'),
      title: pkg.productName,
      minify: isDev ? false : {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true,
      }
    }),
    new ExtractTextPlugin({
      filename: path.join(bundleOutputPath, '[name].[contenthash:8].css'),
      ignoreOrder: true,
      disable: isDev
    }),
    new OptimizeCssAssetsPlugin(),
    new FaviconPlugin({
      logo: path.join(dirs.res, 'img', 'faast-logo.png'),
      prefix: path.join(faviconOutputPath, '[hash:8]/'),
      title: pkg.productName,
      description: pkg.description,
      background: '#181818',
      emitStats: false,
      cache: true,
      inject: true
    }),
    new CopyPlugin([{ from: path.join(dirs.res, 'vendor'), to: vendorOutputPath }]),
    new IncludeAssetsPlugin({
      assets: vendorDeps.map((vendorDep) => path.join(vendorOutputPath, vendorDep)),
      append: false,
      hash: true
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: (module) => module.context && module.context.indexOf('node_modules') >= 0
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),
  ]
})

if (!isDev) {
  config = merge(config, {
    devtool: 'source-map',
    plugins: [
      new CleanPlugin(dirs.buildApp, { root: dirs.root, exclude: [faviconOutputPath.replace(/\/$/, '')] }),
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          mangle: {
            reserved: ['BigInteger', 'ECPair', 'Point']
          }
        }
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.HashedModuleIdsPlugin(),
    ]
  })
} else {
  config = merge(config, {
    devtool: 'eval-source-map',
    devServer: {
      contentBase: dirs.buildApp,
      hot: true,
      historyApiFallback: {
        index: routerBaseName
      },
      headers: { 'Access-Control-Allow-Origin': '*' },
      disableHostCheck: true,
    },
    plugins: [
      new webpack.DefinePlugin({
        SITE_URL: JSON.stringify(process.env.SITE_URL),
        API_URL: JSON.stringify(process.env.API_URL)
      }),
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ]
  })
}

module.exports = config
