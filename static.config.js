import React from 'react'
import path from 'path'
import axios from 'axios'

const webpackConfig = require('./webpack.config.js')
const { getRules } = require('./etc/webpack.common.js')

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
  entry: path.join(__dirname, 'src', 'static', 'index.tsx'),
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
  webpack: (config, { stage }) => {
    config.resolve.extensions = webpackConfig.resolve.extensions
    config.resolve.alias = webpackConfig.resolve.alias
    config.node = {
      ...config.node,
      ...webpackConfig.node,
    }

    config.module.rules = getRules(stage)
    return config
  },
}
