import React, { Fragment } from 'react'
import path from 'path'
import axios from 'axios'
import merge from 'webpack-merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { pick } from 'lodash'
import urlJoin from 'url-join'

const { isDev, dirs, useHttps, siteRoot } = require('./etc/common.js')
const getBaseConfig = require('./etc/webpack.config.base.js')
const siteConfig = require('./src/site/config.js')

const siteUrlProd = 'https://faa.st'

const analyticsCode = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-100689193-1');
`

const Document = ({ Html, Head, Body, children, siteData, routeInfo }) => (
  <Html lang='en'>
    <Head>
      <meta charSet='utf-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta name='description' content={siteConfig.description}/>
      <meta name='author' content={siteConfig.author}/>
      <meta name='referrer' content='origin-when-cross-origin'/>
      <link rel="canonical" href={urlJoin(siteUrlProd, routeInfo.path)}/>
      <link href='/static/vendor/ionicons-2.0/css/ionicons.min.css' rel='stylesheet'/>
      <link href='/static/vendor/font-awesome-5.5/css/all.min.css' rel='stylesheet'/>
      <link rel="icon" href="/favicon.png"/>
      <title>{siteData.title}</title>

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
)

export default {
  entry: path.join(dirs.site, 'index.tsx'),
  siteRoot: siteRoot,
  stagingSiteRoot: '',
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
        })
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
