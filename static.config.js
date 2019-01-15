import React, { Fragment } from 'react'
import path from 'path'
import axios from 'axios'
import merge from 'webpack-merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { pick, get } from 'lodash'


const { dirs, useHttps } = require('./etc/common.js')
const getBaseConfig = require('./etc/webpack.config.base.js')
const siteConfig = require('./src/site/config.js')
const isDev = process.env.NODE_ENV === 'development'

const analyticsCode = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-100689193-1');
`

const generateCombinationsFromArray = (array, property) => {
  let results = []
  for (let i = 0; i <= array.length - 1; i++) {
    for (let j = 0; j <= array.length - 1; j++) {
      if ((array[i][property] !== array[j][property]) && array[i].deposit && array[j].receive) {
        results.push([
          { name: array[i]['name'], symbol: array[i][property] }, 
          { name: array[j]['name'], symbol: array[j][property] }
        ])
      }
    }
    if (i == array.length - 1) {
      return results
    }
  }
}

const Document = ({ Html, Head, Body, children, siteData, routeInfo }) => {
  return (
    <Html lang='en'>
      <Head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='description' content={get(routeInfo, 'routeData.meta.description', siteData.description)}/>
        <meta name='author' content={siteConfig.author}/>
        <meta name='referrer' content='origin-when-cross-origin'/>
        <link href='/static/vendor/ionicons-2.0/css/ionicons.min.css' rel='stylesheet'/>
        <link href='/static/vendor/font-awesome-5.5/css/all.min.css' rel='stylesheet'/>
        <link rel="icon" href="/favicon.png"/>
        <title>{get(routeInfo, 'routeData.meta.title', siteData.title)}</title>
        {/* Google analytics */}
        {!isDev && (
          <Fragment>
            <script async src="https://www.googletagmanager.com/gtag/js?id=UA-100689193-1"></script>
            <script dangerouslySetInnerHTML={{ __html: analyticsCode }}/>
          </Fragment>
        )}
      </Head>
      <Body>{children}</Body>
    </Html>
  )}

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
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl', 'deposit', 'receive'))
    return [
      {
        path: '/',
        component: 'src/site/pages/Home',
        getData: () => ({
          supportedAssets
        }),
        children: generateCombinationsFromArray(supportedAssets, 'symbol').map(pair => {
          const fromSymbol = pair[0].symbol
          const fromName = pair[0].name
          const toSymbol = pair[1].symbol
          const toName = pair[1].name
          return {
            path: `/pairs/${fromSymbol}_${toSymbol}`,
            component: 'src/site/pages/Pair',
            getData: async () => {
              let descriptions = {}
              await Promise.all(pair.map(async (o) => {
                const sym = o.symbol.toLowerCase()
                try {
                  const coinInfo = await axios.get(`https://data.messari.io/api/v1/assets/${sym}/profile`)
                  descriptions[sym.toUpperCase()] = coinInfo.data.data
                  return
                } catch (err) {
                  return
                }
              }))
              return {
                supportedAssets,
                toSymbol,
                fromSymbol,
                fromName,
                toName,
                descriptions,
                meta: {
                  title: `Instantly trade ${fromName} (${fromSymbol}) for ${toName} (${toSymbol}) - Faa.st`,
                  description: `Safely trade your ${fromName} crypto directly from your hardware or software wallet.
                  View ${fromName} (${fromSymbol}) pricing charts, market cap, daily volume and other coin data.`
                }
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
