/* global SITE_URL, API_URL */
import highCharts from './highcharts'
import tokenFunctionSignatures from './tokenFunctionSignatures'
import walletTypes from './walletTypes'
import BigNumber from 'bignumber.js'

BigNumber.config({ FORMAT: {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0
} })

const nodeEnv = process.env.NODE_ENV
const isDev = nodeEnv === 'development'
const isProd = nodeEnv === 'production'
const isIpfs = Boolean(process.env.IPFS)

export default {
  nodeEnv,
  isDev,
  isProd,
  isIpfs,
  logLevel: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  web3Provider: 'https://mainnet.infura.io/v3/6c0b732cae674991b713c9b18ffdd0d3',
  ethereumChainId: 1,
  siteUrl: typeof SITE_URL !== 'undefined' ? SITE_URL : 'https://faa.st',
  apiUrl: typeof API_URL !== 'undefined' ? API_URL : 'https://api.faa.st',
  encrOpts: {
    kdf: 'scrypt',
    n: 1024
  },
  defaultPortfolioId: 'default',
  navbar: {
    expand: 'md',
  },
  affiliateSettings: {
    affiliate_margin: 0.1, 
    affiliate_payment_address: '33WKJWf2iyJHUaRjoHmF7x4rKnENPHC9G8',
  },
  explorerUrls: {
    BTC: 'https://blockchain.info',
    ETH: 'https://etherscan.io',
    LTC: 'https://live.blockcypher.com/ltc',
    BCH: 'https://explorer.bitcoin.com/bch',
  },
  walletTypes,
  web3WalletTypes: Object.entries(walletTypes)
    .filter(([, { web3 }]) => web3)
    .map(([type]) => type),
  highCharts,
  tokenFunctionSignatures
}
