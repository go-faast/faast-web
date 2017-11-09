/* global SITE_URL */
import highCharts from './highCharts'
import tokenFunctionSignatures from './tokenFunctionSignatures'

export default {
  web3Provider: 'https://web3.faa.st:443/eth',
  siteUrl: typeof SITE_URL !== 'undefined' ? SITE_URL : 'https://faa.st',
  hdDerivationPath: {
    ledger: 'm/44\'/60\'/0\'',
    trezor: 'm/44\'/60\'/0\'/0'
  },
  sticky: {
    zIndex: 201
  },
  encrOpts: {
    kdf: 'scrypt',
    n: 1024
  },
  highCharts,
  tokenFunctionSignatures
}
