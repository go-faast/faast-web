import { uniqBy } from 'lodash'
import React from 'react'
import path from 'path'
import axios from 'axios'
import merge from 'webpack-merge'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import { pick, get } from 'lodash'
import urlJoin from 'url-join'
import retry from 'p-retry'

import Wallets from './src/config/walletTypes'
import { translations } from './src/config/translations'

const { dirs, useHttps, siteRoot } = require('./etc/common.js')
const getBaseConfig = require('./etc/webpack.config.base.js')
const siteConfig = require('./src/site/config.js')

const siteUrlProd = 'https://faa.st'

const storageKey = process.env.STORAGE_KEY

/**
 * Redirect to site root at runtime. Needs to be included as inline script
 * because assets won't load if viewing from domain other than site root.
 */
const runtimeRedirect = `
window.siteRoot = ${JSON.stringify(process.env.SITE_ROOT)}
if (window.siteRoot
  && window.location.origin !== window.siteRoot
  && !window.location.search.includes('skipSiteRootRedirect')) {
  window.location.replace(window.siteRoot + window.location.pathname + window.location.search)
}
`

const gtagAnalytics = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'UA-100689193-1');
`

const generateCombinationsFromArray = (array, property) => {
  let results = []
  for (let i = 0; i <= array.length - 1; i++) {
    if (array[i]['receive']) {
      results.push({ name: array[i]['name'], symbol: array[i][property], cmcIDno: array[i]['cmcIDno'], type: 'buy' })
    }
    if (array[i]['deposit']) {
      results.push({ name: array[i]['name'], symbol: array[i][property], cmcIDno: array[i]['cmcIDno'], type: 'sell' })
    }
    if (i == array.length - 1) {
      return results
    }
  }
}

/** Get critical data, fail process on error */
async function criticalGet(url, config) {
  try {
    return await retry(() => axios.get(url, config), { retries: 5, randomize: true, minTimeout: 2000 })
  } catch (e) {
    console.error('Critical request failed, aborting build', e)
    process.exit(1)
  }
}

const Document = ({ Html, Head, Body, children, siteData, routeInfo }) => {
  return (
    <Html lang={get(routeInfo, 'allProps.meta.language', 'en')}>
      <Head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta name='description' content={get(routeInfo, 'allProps.meta.description', siteData.description)}/>
        <meta name='author' content={siteConfig.author}/>
        <meta name='referrer' content='origin-when-cross-origin'/>
        <link rel="canonical" href={urlJoin(siteUrlProd, routeInfo ? routeInfo.path : '')}/>
        <link href='/static/vendor/ionicons-2.0/css/ionicons.min.css' rel='stylesheet'/>
        <link href='/static/vendor/font-awesome-5.5/css/all.min.css' rel='stylesheet'/>
        <link rel="icon" href="/favicon.png"/>
        <title>{get(routeInfo, 'allProps.meta.title', siteData.title)}</title>
        <script dangerouslySetInnerHTML={{ __html: runtimeRedirect }}/>
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-100689193-1"/>
        <script dangerouslySetInnerHTML={{ __html: gtagAnalytics }}/>
      </Head>
      <Body style={{ backgroundColor: get(routeInfo, 'allProps.bgColor', '#181818') }}>{children}</Body>
    </Html>
  )
}

const generateRoutes = ({ mediumPosts, supportedAssets, supportedWallets }) => {
  let routes = []
  return new Promise((resolve, reject) => {
    translations.forEach(async (t) => {
      try {
        const routeConfig = [{
          path: `${t.url}`,
          component: 'src/site/pages/Home1',
          getData: async () => ({
            supportedAssets,
            translations: t.translations,
            meta: {
              title: siteConfig.title,
              description: siteConfig.description,
              language: t.code
            }
          }),
        },
        {
          path: `${t.url}/assets`,
          noindex: true,
          component: 'src/site/pages/SupportedAssets',
          getData: async () => ({
            supportedAssets,
            translations: t.translations,
            meta: {
              ...siteConfig.pageMeta.supportedAssets(),
              language: t.code,
            }
          }),
          children: generateCombinationsFromArray(supportedAssets, 'symbol').map(pair => {
            const symbol = pair.symbol
            const cmcIDno = pair.cmcIDno
            const name = pair.name
            const type = pair.type
            return {
              path: `/${symbol}/${type}`,
              component: 'src/site/pages/Pair',
              getData: async () => {
                let descriptions = {}
                const sym = symbol.toLowerCase()
                try {
                  const coinInfo = await axios.get(`https://data.messari.io/api/v1/assets/${sym}/profile`)
                  descriptions[symbol] = coinInfo.data.data
                } catch (err) {
                  // err
                }
                return {
                  supportedAssets,
                  symbol,
                  name,
                  cmcIDno,
                  type,
                  descriptions,
                  translations: t.translations,
                  meta: {
                    ...siteConfig.pageMeta.asset({ type, symbol, name }),
                    language: t.code,
                  }
                }
              },
            }
          })
        },
        {
          path: `${t.url}/wallets`,
          noindex: true,
          component: 'src/site/pages/Wallets',
          getData: () => ({
            supportedWallets,
          }),
          children: supportedWallets.map(wallet => {
            const name = wallet.name.replace(' Wallet', '')
            const urlName = wallet.name.replace(/\s+/g, '-').toLowerCase()
            return {
              path: `/${urlName}`,
              component: 'src/site/pages/Wallet',
              getData: () => ({
                wallet,
                translations: t.translations,
                meta: {
                  ...siteConfig.pageMeta.wallet({ name }),
                  language: t.code,
                }
              }),
            }
          })
        },
        {
          path: `${t.url}/blog`,
          component: 'src/site/pages/Blog',
          getData: async () => ({
            mediumPosts,
            translations: t.translations,
            meta: {
              ...siteConfig.pageMeta.blog(),
              language: t.code,
            },
            bgColor: '#F5F7F8'
          }),
          children: await Promise.all(mediumPosts.map(async post => {
            let mediumPost = await criticalGet(`https://medium.com/faast/${post.uniqueSlug}?format=json`)
            mediumPost = JSON.parse(mediumPost.data.replace('])}while(1);</x>', ''))
            return ({
              path: `/${post.uniqueSlug}`,
              component: 'src/site/pages/BlogPost',
              getData: async () => ({
                mediumPost,
                translations: t.translations,
                meta: {
                  ...siteConfig.pageMeta.blogPost({ post }),
                  language: t.code,
                },
                bgColor: '#F5F7F8'
              }),
            })
          })) 
        },
        { 
          path: `${t.url}/market-maker`,
          component: 'src/site/pages/MarketMaker',
          getData: async () => ({
            translations: t.translations,
            meta: {
              ...siteConfig.pageMeta.marketMaker(),
              language: t.code,
            },
          }),
        },
        {
          path: `${t.url}/terms`,
          component: 'src/site/pages/Terms',
          getData: async () => ({
            translations: t.translations,
            meta: {
              ...siteConfig.pageMeta.terms(),
              language: t.code,
            }
          }),
        },
        {
          path: `${t.url}/what-is-an-ico`,
          component: 'src/site/pages/IcoIntro',
          getData: async () => {
            return {
              meta: {
                title: 'What is an ICO? - Faa.st',
                description: 'This article describes what an ICO is, how it came to be, and its role in the crypto space.',
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/what-is-the-difference-between-ico-ipo-ito`,
          component: 'src/site/pages/IcoItoIpo',
          getData: async () => {
            return {
              meta: {
                title: 'What is the difference between an ICO, IPO, and ITO? - Faa.st',
                description: 'This article describes the difference between and ICO, IPO, and ITO.',
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/how-to-buy-ethereum`,
          component: 'src/site/pages/BuyEthereum',
          getData: async () => {
            return {
              meta: {
                title: 'How to Buy Ethereum - Faa.st',
                description: 'Ready to take the leap into crypto? This article describes how to buy Ethereum safely and quickly.',
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/what-are-smart-contracts`,
          component: 'src/site/pages/SmartContracts',
          getData: async () => {
            return {
              meta: {
                title: 'What are Smart Contracts? - Faa.st',
                description: 'This article describes what smart contracts are, and the role the play in the Ethereum ecosystem.',
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/what-is-a-dao`,
          component: 'src/site/pages/Dao',
          getData: async () => {
            return {
              meta: {
                title: 'What is a DAO? - Faa.st',
                description: 'Dive deep into decentralized exchanges, how they work, and why they are important.',
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/what-is-ethereum`,
          component: 'src/site/pages/WhatIsEthereum',
          getData: async () => {
            return {
              meta: {
                title: 'What is Ethereum? - Faa.st',
                description: 'Heard about Ethereum, but not sure what it is? This article tells you all you need to know.',
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/privacy`,
          component: 'src/site/pages/Privacy',
          getData: async () => {
            return {
              meta: {
                ...siteConfig.pageMeta.privacy(),
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/newsletter`,
          component: 'src/site/pages/NewsletterLanding',
          getData: async () => {
            return {
              meta: {
                ...siteConfig.pageMeta.newsletter(),
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          path: `${t.url}/pricing`,
          component: 'src/site/pages/Pricing',
          getData: async () => {
            return {
              meta: {
                ...siteConfig.pageMeta.pricing(),
                language: t.code,
              },
              translations: t.translations,
            }
          },
        },
        {
          is404: true,
          noindex: true,
          component: 'src/site/pages/404',
          getData: async () => {
            return {
              meta: {
                ...siteConfig.pageMeta.notFound(),
                language: t.code,
              },
              translations: translations[0].translations,
            }
          },
        }]
        routes = routes.concat(routeConfig)
        if (routes.length >= (translations.length * routeConfig.length)) {
          resolve(routes)
        }
      } catch (err) {
        reject(err)
      }
    })
  })
}

export default {
  entry: path.join(dirs.site, 'index.tsx'),
  siteRoot: siteRoot,
  stagingSiteRoot: '',
  getSiteData: () => ({
    title: siteConfig.title,
    lastBuilt: Date.now(),
  }),
  Document,
  getRoutes: async () => {
    const { data: assets } = await criticalGet('https://api.faa.st/api/v2/public/currencies', {
      params: {
        include: 'marketInfo'
      }
    })
    const supportedAssets = assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => ({ ...pick(asset, ['symbol', 'name', 'iconUrl', 'deposit', 'receive', 'cmcIDno']), marketCap: asset.marketInfo.quote.USD.market_cap || 0 }))
    const supportedWallets = Object.values(Wallets)
    let mediumProfile = await criticalGet('https://medium.com/faast?format=json')
    mediumProfile = JSON.parse(mediumProfile.data.replace('])}while(1);</x>', ''))
    let mediumPosts = Object.values(mediumProfile.payload.references.Post)
    let dbPosts = []
    if (!storageKey) {
      console.log('No STORAGE_KEY provided, skipping blog post caching')
    } else {
      try {
        const posts = await axios.get('https://api.faa.st/api/v1/storage/blog', {
          headers: {
            'Content-Type': 'application/json',
            'key': storageKey
          }
        })
        dbPosts = posts.data.records ? posts.data.records : dbPosts
      } catch (err) {
        console.log('error retrieving posts')
      }
      mediumPosts.map(async (post) => {
        if (!dbPosts.some(savedPost => savedPost.data.uniqueSlug == post.uniqueSlug)) {
          try {
            await axios.post(`https://api.faa.st/api/v1/storage/blog/${post.uniqueSlug}`, {
              ...post,
              uniqueSlug: post.uniqueSlug,
            }, 
            {
              headers: {
                'Content-Type': 'application/json',
                'key': storageKey
              }
            })
          } catch (err) {
            // error saving post
            console.log('error saving post')
          }
        }
      })
    }
    dbPosts = dbPosts.filter(p => p.uniqueSlug)
    mediumPosts = dbPosts ? dbPosts.concat(mediumPosts) : mediumPosts
    mediumPosts = uniqBy(mediumPosts, 'uniqueSlug')
    return generateRoutes({ mediumPosts, supportedAssets, supportedWallets })
      .then(routes => routes)
      .catch(e => console.log(e))
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
