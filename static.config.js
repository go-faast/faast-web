import path from 'path'
import axios from 'axios'
import ExtractTextPlugin from 'extract-text-webpack-plugin'

const webpackConfig = require('./webpack.config.js')

export default {
  entry: path.join(__dirname, 'src', 'static', 'index.tsx'),
  siteRoot: 'https://faa.st',
  getSiteData: () => ({
    title: 'Trade Crypto - Faast',
  }),
  getRoutes: async () => {
    const assets = await axios.get('https://api.faa.st/api/v2/public/currencies')
    return [
      {
        path: '/',
        component: 'src/static/pages/Home',
        getData: () => ({
          assets
        })
      },
      {
        is404: true,
        component: 'src/static/pages/404',
      },
    ]
  },
  webpack: (config, { defaultLoaders, stage }) => {
    config.resolve.extensions = webpackConfig.resolve.extensions
    config.resolve.alias = webpackConfig.resolve.alias
    config.node = {
      ...config.node,
      ...webpackConfig.node,
    }

    let sassLoaders = []
    if (stage === 'dev') {
      sassLoaders = [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }]
    } else {
      sassLoaders = [
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            minimize: stage === 'prod',
            sourceMap: true,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            config: {
              path: path.resolve(__dirname, './postcss.config.js'),
            }
          }
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            includePaths: [path.join(__dirname, 'node_modules')],
            sourceMapContents: true,
            outputStyle: 'expanded',
            precision: 6,
          },
        },
      ]

      // Don't extract css to file during node build process
      if (stage !== 'node') {
        sassLoaders = ExtractTextPlugin.extract({
          fallback: {
            loader: 'style-loader',
            options: {
              sourceMap: true,
              hmr: false,
            },
          },
          use: sassLoaders,
        })
      }
    }

    config.module.rules = [
      {
        oneOf: [
          {
            test: /\.s(a|c)ss$/,
            use: sassLoaders,
          },
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: defaultLoaders.jsLoader.exclude, // as std jsLoader exclude
            use: [
              {
                loader: 'babel-loader',
              },
              {
                loader: require.resolve('ts-loader'),
                options: {
                  transpileOnly: true,
                },
              },
            ],
          },
          defaultLoaders.cssLoader,
          defaultLoaders.fileLoader,
        ],
      },
    ]
    return config
  },
}
