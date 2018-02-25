
const assets = {
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    walletUrl: 'faa.st/asset/ETH/walletUrl',
    infoUrl: 'faa.st/asset/ETH/infoUrl',
    deposit: true,
    receive: true,
  }
}

const priceData = {
  ETH: {
    symbol: 'ETH',
    price_usd: 1234.56,
    percent_change_1h: 1.23,
    percent_change_24h: 4.56,
    percent_change_7d: 7.89,
    '24h_volume_usd': 123456789,
    market_cap_usd: 9876543210,
    available_supply: 99999999,
    last_updated: '123456789'
  }
}

const getAssets = () => Promise.resolve(Object.values(assets))

const getAssetPrice = (symbol) => {
  if (!priceData[symbol]) {
    return Promise.reject(new Error(`No price data mocked for ${symbol}`))
  }
  return Promise.resolve(priceData[symbol])
}

const getAssetPrices = () => Promise.resolve(Object.values(priceData))

const getPriceChart = (symbol) => Promise.resolve({})

const getMarketInfo = (pair) => Promise.resolve({})

const postExchange = (info) => Promise.resolve({})

const getOrderStatus = (depositSymbol, receiveSymbol, address, timestamp) => Promise.resolve({})

const getSwundle = (address) => Promise.resolve({})

const postSwundle = (address, swap) => Promise.resolve({})

const removeSwundle = (address) => Promise.resolve({})

export default {
  getAssets,
  getAssetPrice,
  getAssetPrices,
  getPriceChart,
  getMarketInfo,
  postExchange,
  getOrderStatus,
  getSwundle,
  postSwundle,
  removeSwundle,
}
