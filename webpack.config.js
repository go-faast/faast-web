const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FaviconPlugin = require('favicons-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const pkg = require('./package.json')

const DEFAULT_NODE_ENV = 'production'
let NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  console.log(`NODE_ENV not specified, using ${DEFAULT_NODE_ENV}`)
  NODE_ENV = DEFAULT_NODE_ENV
}
const isDev = NODE_ENV === 'development'

const isMocking = Boolean(process.env.MOCK)

const projectRoot = path.resolve(__dirname)
const dist = path.join(projectRoot, 'dist')
const src = path.join(projectRoot, 'src')
const res = path.join(projectRoot, 'res')
const test = path.join(projectRoot, 'test')
const nodeModules = path.join(projectRoot, 'node_modules')

const cssLoader = ({ sourceMap = true, modules = true } = {}) => ExtractTextPlugin.extract({
  fallback: 'style-loader',
  use: [{
    loader: 'css-loader', // translates CSS into CommonJS modules
    options: {
      sourceMap,
      modules,
      minimize: !isDev,
      importLoaders: 2,
      localIdentName: isDev ? '[name]__[local]__[hash:base64:5]' : '[hash:base64]'
    }
  }, {
    loader: 'postcss-loader', // Run post css actions
    options: {
      sourceMap,
      plugins: () => [ // post css plugins, can be exported to postcss.config.js
        require('precss'),
        require('autoprefixer')
      ]
    }
  }, {
    loader: 'sass-loader', // compiles SASS to CSS
    options: { 
      includePaths: [nodeModules],
      sourceMap,
      data: `$env: ${NODE_ENV};` // Inject env as sass variable
    }
  }]
})

const fileOutputPath = 'file/'
const fileLoader = () => ({
  loader: 'file-loader',
  options: {
    outputPath: fileOutputPath
  }
})

const assetOutputPath = 'asset/'
const assetLoader = (subDir) => ({
  loader: 'file-loader',
  options: {
    context: res,
    outputPath: assetOutputPath,
    name: isDev ? '[path][name].[ext]' : `${subDir}/[hash].[ext]`
  }
})

let config = {
  context: projectRoot,
  entry: path.join(src, 'index.jsx'),
  output: {
    path: dist,
    filename: isDev ? 'portfolio.js' : 'portfolio.[hash:10].js'
  },
  node: {
    fs: 'empty',
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      rules: [{
        resourceQuery: /worker/,
        loader: 'worker-loader',
        options: { inline: true }
      }, {
        exclude: /node_modules/,
        loader: 'babel-loader'
      }]
    }, {
      test: /(\.css|\.scss)$/,
      oneOf: [
        {
          resourceQuery: /nsm/,
          use: cssLoader({ modules: false })
        },
        {
          use: cssLoader(),
        }
      ]
    }, {
      resourceQuery: /file/,
      use: fileLoader()
    }, {
      test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
      use: assetLoader('img')
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: assetLoader('font')
    }]
  },
  resolve: {
    alias: {
      Src: src,
      Res: res,
      Test: test,
      Img: 'Res/img',
      Mock: 'Test/mock',
      Config: 'Src/config',
      Utilities: 'Src/utilities',
      Services: isMocking ? 'Mock/services' : 'Src/services',
      App: 'Src/app',
      Components: 'App/components',
      Styles: 'App/styles',
      Actions: 'App/actions',
      Hoc: 'App/hoc',
      Selectors: 'App/selectors'
    },
    extensions: ['.js', '.jsx', '.json', '.scss', '.css']
  },
  plugins: [
    new CleanPlugin(['*.*', assetOutputPath, fileOutputPath], { root: dist }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    }),
    new HtmlPlugin({
      template: path.join(src, 'index.html'),
      filename: 'index.html',
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
      filename: 'style.[contenthash:10].css',
      allChunks: true,
      ignoreOrder: true,
      disable: isDev
    }),
    new FaviconPlugin({
      logo: path.join(res, 'img', 'faast-logo.png'),
      prefix: 'favicon-[hash:10]/',
      title: pkg.productName,
      description: pkg.description,
      background: '#181818',
      emitStats: false,
      cache: true,
      inject: true
    }),
    new CopyPlugin([{ from: path.join(res, 'vendor'), to: path.join(dist, 'vendor') }])
  ]
}

if (!isDev) {
  config = merge(config, {
    devtool: 'source-map',
    plugins: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          mangle: {
            reserved: ['BigInteger', 'ECPair', 'Point']
          }
        }
      })
    ]
  })
} else {
  config = merge(config, {
    devtool: 'eval-source-map',
    devServer: {
      contentBase: dist,
      hot: true,
      compress: true,
      historyApiFallback: true,
      inline: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
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
