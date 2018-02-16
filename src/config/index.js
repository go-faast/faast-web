/* global SITE_URL, API_URL */
import highCharts from './highCharts'
import tokenFunctionSignatures from './tokenFunctionSignatures'
import BigNumber from 'bignumber.js'

BigNumber.config({ FORMAT: {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0
}})

export default {
  web3Provider: 'https://web3.faa.st/eth',
  bitcoreInsightApi: 'https://bitcore.faa.st/insight-api',
  siteUrl: typeof SITE_URL !== 'undefined' ? SITE_URL : 'https://faa.st',
  apiUrl: typeof API_URL !== 'undefined' ? API_URL : 'https://api.faa.st/api/v1/public',
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
