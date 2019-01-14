import React from 'react'
import path from 'path'
import axios from 'axios'
import merge from 'webpack-merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { pick } from 'lodash'


const { dirs, useHttps } = require('./etc/common.js')
const getBaseConfig = require('./etc/webpack.config.base.js')
const siteConfig = require('./src/site/config.js')
const isDev = process.env.NODE_ENV === 'development'

const analyticsCode = `
(function(h,o,t,j,a,r){
  h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
  h._hjSettings={hjid:875945,hjsv:6};
  a=o.getElementsByTagName('head')[0];
  r=o.createElement('script');r.async=1;
  r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
  a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
`

const generateCombinationsFromArray = (array, property, separator = '-') => {
  let results = []
  for (let i = 0; i <= array.length - 1; i++) {
    for (let j = 0; j <= array.length - 1; j++) {
      if (array[i][property] !== array[j][property]) {
        results.push(`${array[i][property]}${separator}${array[j][property]}`)
      }
    }
    if (i == array.length - 1) {
      return results
    }
  }
}

const Document = ({ Html, Head, Body, children, siteData }) => (
  <Html lang='en'>
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name='description' content={siteConfig.description}/>
      <meta name='author' content={siteConfig.author}/>
      <meta name='referrer' content='origin-when-cross-origin'/>
      <link href='/static/vendor/ionicons-2.0/css/ionicons.min.css' rel='stylesheet'/>
      <link href='/static/vendor/font-awesome-5.5/css/all.min.css' rel='stylesheet'/>
      <link rel="icon" href="/favicon.png"/>
      <title>{siteData.title}</title>

      {/* Hotjar Tracking Code */}
      {!isDev && (
        <script dangerouslySetInnerHTML={{ __html: analyticsCode }}/>
      )}
    </Head>
    <Body>{children}</Body>
  </Html>
)

export default {
  entry: path.join(dirs.site, 'index.tsx'),
  siteRoot: process.env.SITE_ROOT || '', // Leave empty to build for all environments
  getSiteData: () => ({
    title: 'Trade Crypto - Faast',
    lastBuilt: Date.now(),
  }),
  Document,
  getRoutes: async () => {
    const { data: assets } = await axios.get('https://api.faa.st/api/v2/public/currencies')
    const supportedAssets = assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl'))
    return [
      {
        path: '/',
        component: 'src/site/pages/Home',
        getData: () => ({
          supportedAssets
        }),
        children: generateCombinationsFromArray(supportedAssets, 'symbol', '-').map(pair => {
          return {
            path: `/pairs/${pair}`,
            component: 'src/site/pages/Pair',
            getData: async () => {
              let descriptions = {}
              let symbols = [pair.split('-')[0].toLowerCase(), pair.split('-')[1].toLowerCase()]
              await Promise.all(symbols.map(async (sym) => {
                try {
                  const coinInfo = await axios.get(`https://data.messari.io/api/v1/assets/${sym}/profile`)
                  descriptions[sym.toUpperCase()] = coinInfo.data.data
                  return
                } catch (err) {
                  console.log('there was an error', sym)
                  return
                }
              }))
              return {
                supportedAssets,
                pair,
                descriptions
              }
            },
          }
        }),
      },
      {
        path: '/terms',
        component: 'src/site/pages/Terms',
      },
      {
        path: '/privacy',
        component: 'src/site/pages/Privacy',
      },
      {
        path: '/pricing',
        component: 'src/site/pages/Pricing',
      },
      {
        is404: true,
        component: 'src/site/pages/404',
      },
    ]
  },
  paths: {
    dist: dirs.buildSite,
  },
  devServer: {
    https: useHttps,
    host: useHttps ? 'https://localhost' : 'http://localhost',
  },
  webpack: (defaultConfig, { stage }) => {
    // Omit old version of UglifyJsPlugin because we use a newer one
    defaultConfig.plugins = defaultConfig.plugins.filter((plugin) =>
      plugin.constructor.name !== 'UglifyJsPlugin')

    const baseConfig = getBaseConfig(stage)

    const config = merge.strategy({
      'module.rules': 'replace',
    })(defaultConfig, baseConfig)
    if (stage === 'node') {
      // Needed for css modules to work. See https://github.com/nozzle/react-static/issues/601#issuecomment-429574588
      config.plugins = [
        ...config.plugins,
        new ExtractTextPlugin({
          filename: '_tmp/static.css',
        }),
      ]
    }
    return config
  },
}
