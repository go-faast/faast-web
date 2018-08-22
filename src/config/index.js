/* global SITE_URL, API_URL */
import highCharts from './highCharts'
import tokenFunctionSignatures from './tokenFunctionSignatures'
import BigNumber from 'bignumber.js'

import ledgerLogo from 'Img/wallet/ledger-logo.png'
import trezorLogo from 'Img/wallet/trezor-logo.png'

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
  web3Provider: 'https://mainnet.infura.io/0eUbsHtOiSVZZEiR5fQX',
  bitcoreInsightApi: 'https://bitcore.faa.st/insight-api',
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
  explorerUrls: {
    BTC: 'https://blockchain.info',
    ETH: 'https://etherscan.io',
  },
  walletTypes: {
    ledger: {
      name: 'Ledger Wallet',
      icon: ledgerLogo,
      supportedAssets: {
        ETH: {
          derivationPath: 'm/44\'/60\'/0\''
        },
        BTC: {
          derivationPath: 'm/49\'/0\'/0\'',
          segwitPrefix: 'm/49',
          legacyPrefix: 'm/44',
        }
      }
    },
    trezor: {
      name: 'TREZOR',
      icon: trezorLogo,
      supportedAssets: {
        ETH: {
          derivationPath: 'm/44\'/60\'/0\'/0'
        },
        BTC: {
          derivationPath: null
        }
      }
    }
  },
  highCharts,
  tokenFunctionSignatures
}
