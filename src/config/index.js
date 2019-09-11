import highCharts from './highcharts'
import tokenFunctionSignatures from './tokenFunctionSignatures'
import walletTypes from './walletTypes'
import extraAssetFields from './extraAssetFields'
import envConfig from './environment'
import BigNumber from 'bignumber.js'

BigNumber.config({ FORMAT: {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0
} })

export default {
  ...envConfig,
  web3Provider: 'https://mainnet.infura.io/v3/6c0b732cae674991b713c9b18ffdd0d3',
  ethereumChainId: 1,
  encrOpts: {
    kdf: 'scrypt',
    n: 1024
  },
  defaultPortfolioId: 'default',
  navbar: {
    expand: 'md',
  },
  affiliateSettings: {
    affiliate_margin: 0.2, 
    affiliate_id: 'DLABdEEmJUcLfLs2Y7jkkZntvdENT3nL',
  },
  explorerUrls: {
    BTC: 'https://blockchain.info',
    ETH: 'https://etherscan.io',
    LTC: 'https://live.blockcypher.com/ltc',
    BCH: 'https://explorer.bitcoin.com/bch',
  },
  bip21Prefixes: {
    BTC: 'bitcoin',
    BCH: 'bitcoincash',
    LTC: 'litecoin',
    ETH: 'ethereum',
    XMR: 'monero_wallet'
  },
  defaultWatchlist: ['BTC', 'ETH', 'BCH', 'EOS', 'LTC', 'USDT', 'XMR', 'TRX', 'DASH', 'MIOTA'],
  walletTypes,
  web3WalletTypes: Object.entries(walletTypes)
    .filter(([, { web3 }]) => web3)
    .map(([type]) => type),
  highCharts,
  tokenFunctionSignatures,
  extraAssetFields,
}
