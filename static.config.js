import React from 'react'
import path from 'path'
import axios from 'axios'
import merge from 'webpack-merge'

const { dirs } = require('./etc/common.js')
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

const Document = ({ Html, Head, Body, children }) => (
  <Html lang="en">
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={siteConfig.description}/>
      <meta name="author" content={siteConfig.author}/>
      <meta name="referrer" content="origin-when-cross-origin"/>
      <link href="static/vendor/ionicons/css/ionicons.min.css" rel="stylesheet"/>

      {/* Hotjar Tracking Code */}
      {!isDev && (
        <script dangerouslySetInnerHTML={{ _html: analyticsCode }}/>
      )}
    </Head>
    <Body>{children}</Body>
  </Html>
)

export default {
  entry: path.join(dirs.site, 'index.tsx'),
  siteRoot: 'https://faa.st',
  getSiteData: () => ({
    title: 'Trade Crypto - Faast',
  }),
  Document,
  getRoutes: async () => {
    const { data: assets } = await axios.get('https://api.faa.st/api/v2/public/currencies')
    return [
      {
        path: '/',
        component: 'src/site/pages/Home',
        getData: () => ({
          assets
        })
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
  webpack: (defaultConfig, { stage }) => {
    const baseConfig = getBaseConfig(stage)
    const config = merge.strategy({
      'module.rules': 'replace',
    })(defaultConfig, baseConfig)
    return config
  },
}
