const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const convPaths = require('convert-tsconfig-paths-to-webpack-aliases').default

const {
  useHttps, dirs, imgOutputPath, fontOutputPath, fileOutputPath, bundleOutputPath, 
} = require('./common.js')

// Needs to be valid JSON. All comments in tsconfig.json must be removed.
const tsconfig = require('../tsconfig.json')
const aliases = convPaths(tsconfig)

module.exports = function (stage, outputPathPrefix = '') {
  const isDev = stage === 'dev'

  const jsLoader = {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
    }
  }

  const cssLoader = ({ sourceMap = true, modules = true } = {}) => {
    const primaryCssLoaders = [{
      loader: 'css-loader', // translates CSS into CommonJS modules
      options: {
        sourceMap,
        modules,
        minimize: false, // CSS minification handled by OptimizeCssAssetsPlugin
        importLoaders: 2,
        localIdentName: isDev ? '[name]__[local]__[hash:base64:5]' : '[hash:base64:12]'
      }
    }, {
      loader: 'postcss-loader', // Run post css actions
      options: {
        sourceMap,
        config: {
          path: path.resolve(__dirname, './postcss.config.js'),
        }
      }
    }, {
      loader: 'sass-loader', // compiles SASS to CSS
      options: { 
        sourceMap,
        includePaths: [dirs.nodeModules, dirs.src],
        sourceMapContents: true,
        outputStyle: 'expanded',
        precision: 6,
      }
    }]
    if (stage === 'dev') {
      return ['style-loader', ...primaryCssLoaders]
    }
    return ExtractTextPlugin.extract({
      fallback: {
        loader: 'style-loader',
        options: {
          sourceMap,
          hmr: false,
        },
      },
      use: primaryCssLoaders,
    })
  }

  const assetLoader = (outputPath) => ({
    loader: 'file-loader',
    options: {
      context: dirs.root,
      outputPath: path.join(outputPathPrefix, outputPath.endsWith('/') ? outputPath : outputPath + '/'),
      name: '[name].[hash:8].[ext]'
    }
  })
  const imgAssetLoader = assetLoader(imgOutputPath)
  const fontAssetLoader = assetLoader(fontOutputPath)
  const fileAssetLoader = assetLoader(fileOutputPath)

  const rules = [{
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      jsLoader,
      { loader: 'ts-loader' },
    ]
  }, {
    test: /\.jsx?$/,
    rules: [{
      resourceQuery: /worker/,
      loader: 'worker-loader',
      options: {
        name: path.join(outputPathPrefix, bundleOutputPath, 'worker.[hash:8].js'),
        // Web workers break when using dev proxy because cross-origin isn't
        // allowed. Override public path to force same origin
        publicPath: isDev ? '/' : undefined,
      }
    }, {
      exclude: /node_modules/,
      use: [jsLoader]
    }]
  }, {
    test: /(\.css|\.scss)$/,
    oneOf: [{
      resourceQuery: /(nsm|global)/,
      use: cssLoader({ modules: false })
    }, {
      use: cssLoader(),
    }]
  }, {
    resourceQuery: /file/,
    use: fileAssetLoader
  }, {
    test: /\.svg$/,
    oneOf: [{     
      resourceQuery: /inline/,
      loader: 'svg-react-loader'
    }, {
      use: imgAssetLoader
    }]
  }, {
    test: /\.(png|jpe?g|gif|ico)(\?.*)?$/,
    use: imgAssetLoader
  }, {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    use: fontAssetLoader
  }]

  return {
    module: {
      rules,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss', '.css'],
      alias: aliases,
    },
    node: {
      fs: 'empty',
      __filename: true,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.IPFS': JSON.stringify(process.env.IPFS),
        'process.env.SITE_ROOT': JSON.stringify(process.env.SITE_ROOT),
        'process.env.DEPLOY_ENV': JSON.stringify(process.env.DEPLOY_ENV),
        'process.env.API_URL': JSON.stringify(process.env.API_URL),
      }),
      ...(stage !== 'prod' ? [] : [
        new OptimizeCssAssetsPlugin(),
        new UglifyJsPlugin({
          sourceMap: true,
          uglifyOptions: {
            mangle: {
              reserved: ['BigInteger', 'ECPair', 'Point']
            }
          }
        }),
      ])
    ],
    devServer: {
      https: useHttps,
      host: 'localhost',
    }
  }
}
