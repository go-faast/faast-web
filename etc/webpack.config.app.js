const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconPlugin = require('favicons-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const IncludeAssetsPlugin = require('html-webpack-include-assets-plugin')

const pkg = require('../package.json')

const {
  isDev, isIpfs, useHttps, dirs, appPath, bundleOutputPath, vendorOutputPath, faviconOutputPath,
} = require('./common.js')

const getBaseConfig = require('./webpack.config.base.js')

const APP_PORT = process.env.APP_PORT || 8080

const vendorDeps = ['font-awesome-4.7/css/font-awesome.min.css']

const routerBaseName = path.join('/', appPath)
const outputPathPrefix = isDev ? appPath : '' // Prefix output path during development for proxy purposes
const baseConfig = getBaseConfig(isDev ? 'dev' : 'prod', outputPathPrefix)

let config = merge.strategy({
  'module.rules': 'replace',
})(baseConfig, {
  context: dirs.root,
  entry: ['babel-polyfill', path.join(dirs.app, 'index.jsx')],
  output: {
    filename: path.join(outputPathPrefix, bundleOutputPath, isDev ? '[name].[hash:8].js' : '[name].[chunkHash:8].js'),
    path: dirs.buildApp,
    publicPath: isIpfs ? './' : '/',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ROUTER_BASE_NAME': JSON.stringify(routerBaseName),
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
    new FaviconPlugin({
      logo: path.join(dirs.res, 'img', 'faast-logo.png'),
      prefix: path.join(outputPathPrefix, faviconOutputPath, '[hash:8]/'),
      title: pkg.productName,
      description: pkg.description,
      background: '#181818',
      emitStats: false,
      cache: true,
      inject: true
    }),
    new CopyPlugin([{ from: path.join(dirs.res, 'vendor'), to: path.join(outputPathPrefix, vendorOutputPath) }]),
    new IncludeAssetsPlugin({
      assets: vendorDeps.map((vendorDep) => path.join(outputPathPrefix, vendorOutputPath, vendorDep)),
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
      new ExtractTextPlugin({
        filename: path.join(outputPathPrefix, bundleOutputPath, '[name].[contenthash:8].css'),
        ignoreOrder: true,
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.HashedModuleIdsPlugin(),
    ]
  })
} else {
  config = merge(config, {
    output: {
      publicPath: `${useHttps ? 'https' : 'http'}://localhost:${APP_PORT}/`, // Required for HMR behind proxy
    },
    devtool: 'eval-source-map',
    devServer: {
      port: APP_PORT,
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
