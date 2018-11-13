import React from 'react'
import path from 'path'
import axios from 'axios'
import merge from 'webpack-merge'

const { dirs } = require('./common.js')
const getBaseConfig = require('./webpack.config.base.js')

const Document = ({ Html, Head, Body, children }) => (
  <Html lang="en-US">
    <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
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
