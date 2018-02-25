import assets from 'Mock/assets'
import assetPrices from 'Mock/assetPrices'

const indexBySymbol = (arr) => arr.reduce((bySymbol, a) => ({ ...bySymbol, [a.symbol]: a }), {})

const assetPriceBySymbol = indexBySymbol(assetPrices)

const getAssets = () => Promise.resolve(assets)

const getAssetPrice = (symbol) => {
  if (!assetPriceBySymbol[symbol]) {
    return Promise.reject(new Error(`No price data mocked for ${symbol}`))
  }
  return Promise.resolve(assetPriceBySymbol[symbol])
}

const getAssetPrices = () => Promise.resolve(assetPrices)

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
