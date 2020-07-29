const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconPlugin = require('favicons-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const IncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const createVariants = require('parallel-webpack').createVariants

const pkg = require('../package.json')
const baseOptions = {
  preferredDevTool: process.env.DEVTOOL || 'eval'
}
const variants = {
}

const {
  isDev, isIpfs, useHttps, dirs, widgetPath, bundleOutputPath, vendorOutputPath, faviconOutputPath,
} = require('./common.js')

const getBaseConfig = require('./webpack.config.base.js')

const APP_PORT = process.env.APP_PORT || 9000

const vendorDeps = ['font-awesome-4.7/css/font-awesome.min.css']

const routerBaseName = path.join('/', widgetPath)
const outputPathPrefix = isDev ? widgetPath : 'widget' // Prefix output path during development for proxy purposes
const baseConfig = getBaseConfig(isDev ? 'dev' : 'prod', outputPathPrefix)

let config = merge.strategy({
  'module.rules': 'replace',
})(baseConfig, {
  context: dirs.root,
  entry: ['babel-polyfill', path.join(dirs.widget, 'index.jsx')],
  output: {
    filename: path.join(outputPathPrefix, bundleOutputPath, isDev ? '[name].[hash:8].js' : '[name].[chunkHash:8].js'),
    path: dirs.buildWidget,
    publicPath: isIpfs ? './' : '/widget',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ROUTER_BASE_NAME': JSON.stringify(routerBaseName),
    }),
    new HtmlPlugin({
      template: path.join(dirs.widget, 'index.html'),
      filename: path.join(widgetPath, 'index.html'),
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
      new CleanPlugin(dirs.buildWidget, { root: dirs.root, exclude: [faviconOutputPath.replace(/\/$/, '')] }),
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
      contentBase: dirs.buildWidget,
      hot: true,
      historyApiFallback: {
        index: routerBaseName
      },
      headers: { 'Access-Control-Allow-Origin': '*' },
      disableHostCheck: true,
    },
    plugins: [
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ]
  })
}

module.exports = createVariants(baseOptions, variants, () => config)
