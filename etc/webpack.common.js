const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const root = path.resolve(__dirname, '..')
const src = path.join(root, 'src')
const res = path.join(root, 'res')
const test = path.join(root, 'test')
const nodeModules = path.join(root, 'node_modules')

const assetOutputPath = 'asset/'
const vendorOutputPath = 'vendor/'
const workerOutputPath = 'worker/'
const faviconOutputPath = 'favicon/'

function getRules(stage) {
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
        localIdentName: isDev ? '[name]__[local]__[hash:base64:5]' : '[hash:base64]'
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
        includePaths: [nodeModules],
        sourceMapContents: true,
        outputStyle: 'expanded',
        precision: 6,
      }
    }]
    if (stage === 'prod') {
      return ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: primaryCssLoaders,
      })
    }
    if (stage === 'dev') {
      return ['style-loader', ...primaryCssLoaders]
    }
    // -> stage === 'node'
    return primaryCssLoaders
  }

  const assetLoader = (subDir) => ({
    loader: 'file-loader',
    options: {
      context: root,
      outputPath: assetOutputPath,
      name: `${subDir}/[name].[hash:8].[ext]`
    }
  })
  const imgAssetLoader = assetLoader('img')
  const fontAssetLoader = assetLoader('font')
  const fileAssetLoader = assetLoader('file')

  return [{
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
        name: workerOutputPath + 'worker.[hash:8].js'
      }
    }, {
      exclude: /node_modules/,
      use: [jsLoader]
    }]
  }, {
    test: /(\.css|\.scss)$/,
    oneOf: [{
      resourceQuery: /nsm/,
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
}

module.exports = {
  getRules,
  dirs: {
    root,
    src,
    res,
    test,
    nodeModules,
  },
  workerOutputPath,
  vendorOutputPath,
  faviconOutputPath,
  assetOutputPath,
}
