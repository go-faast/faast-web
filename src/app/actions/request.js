import {
  toBigNumber,
  toUnit,
  toPercentage
} from 'Utilities/convert'
import { fixPercentageRounding, filterErrors, filterObj } from 'Utilities/helpers'
import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import { clearSwap } from 'Utilities/storage'
import log from 'Utilities/log'
import { loadingPortfolio, setPortfolio, setAssets, updateSwapOrder } from 'Actions/redux'
import { restoreSwundle } from 'Actions/portfolio'
import { updateWalletBalances } from 'Redux/wallets/actions'
import config from 'Config'

const ENABLED_ASSETS = ['ETH']

export const getFiatPrice = (symbol, mock) => () => {
  if (mock && mock[symbol] && mock[symbol].hasOwnProperty('price')) {
    return Promise.resolve({ price_usd: toBigNumber(mock[symbol].price) })
  }
  return fetchGet(`${config.siteUrl}/app/portfolio-price/${symbol}`)
    .then((data) => {
      if (data.error) throw new Error(data.error)

      return data
    })
}

export const getPriceChart = (symbol) => () => {
  return fetchGet(`${config.siteUrl}/app/portfolio-chart/${symbol}`)
    .then((data) => {
      if (data.error) throw new Error(data.error)
      return data
    })
}

export const getFiatPrices = (list, mock) => () => {
  return fetchGet(`${config.siteUrl}/app/portfolio-price`)
    .then((data) => {
      if (data.error) throw new Error(data.error)

      return list.map(a => {
        if (mock && mock[a.symbol] && mock[a.symbol].hasOwnProperty('price')) {
          return Object.assign({}, a, {
            price: toBigNumber(mock[a.symbol].price),
            change24: toBigNumber(0)
          })
        }

        const priceData = data.find(b => b.symbol === a.symbol)
        if (!priceData) return a

        return Object.assign({}, a, {
          price: toBigNumber(priceData.price_usd || 0),
          change24: toBigNumber(priceData.percent_change_24h || 0),
          volume24: toBigNumber(priceData['24h_volume_usd'] || 0),
          marketCap: toBigNumber(priceData.market_cap_usd || 0),
        })
      })
    })
    .catch((e) => {
      log.error(e)
      return list
    })
}

const preparePortfolio = (assets, mock) => () => {
  log.info('preparing portfolio')
  return assets.map((a) => {
    if (a.ERC20 && !a.contractAddress) {
      console.log(`contractAddress is missing for ERC20 token ${a.symbol}`)
    }
    const portfolioSupport = (a.ERC20 && a.contractAddress) || ENABLED_ASSETS.includes(a.symbol)
    const swapSupport = a.deposit && a.receive
    const assetObj = Object.assign({}, a, {
      portfolio: portfolioSupport && swapSupport
    })
    if (mock && mock[a.symbol] && mock[a.symbol].price) {
      assetObj.price = mock[a.symbol].price
    }
    return assetObj
  })
}

export const getBalances = (assets, portfolio, walletId, mock) => (dispatch) => {
  let portfolioList = portfolio.list
  if (!portfolioList || !portfolioList.length) {
    dispatch(loadingPortfolio(true))
    portfolioList = dispatch(preparePortfolio(assets, mock))
  }
  return dispatch(getFiatPrices(portfolioList, mock))
    .then((p) => dispatch(updateWalletBalances(walletId, assets))
      .then((symbolToBalance) => p.map((a) => Object.assign({}, a, {
        balance: symbolToBalance[a.symbol] || toBigNumber(0)
      }))))
    .then((p) => {
      // let pendingFiat = toBigNumber(0)
      // if (swap) {
      //   pendingFiat = swap.reduce((sCurr, send) => {
      //     const rFiat = send.list.reduce((rCurr, receive) => {
      //       const status = getSwapStatus(receive)
      //       if (status.details === 'waiting for transaction receipt' || status.details === 'processing swap') {
      //         const toAsset = p.find(a => a.symbol === receive.symbol)
      //         const receiveEst = estimateReceiveAmount(receive, toAsset)
      //         return toPrecision(receiveEst.times(toAsset.price), 2).add(rCurr)
      //       } else {
      //         return rCurr
      //       }
      //     }, toBigNumber(0))
      //     return rFiat.add(sCurr)
      //   }, toBigNumber(0))
      // }

      let totalFiat = toBigNumber(0);
      let totalFiat24hAgo = toBigNumber(0)
      let newPortfolio = p.map(a => {
        if (a.symbol === 'ETH' || a.balance.greaterThan(0)) {
          return Object.assign({}, a, { shown: true })
        } else {
          return a
        }
      })
      newPortfolio = newPortfolio.map((b) => {
        const fiat = toUnit(b.balance, b.price, 2)
        const price24hAgo = b.price.div(b.change24.plus(100).div(100))
        const fiat24hAgo = toUnit(b.balance, price24hAgo, 2)
        totalFiat = totalFiat.plus(fiat)
        totalFiat24hAgo = totalFiat24hAgo.plus(fiat24hAgo)
        return Object.assign({}, b, { fiat })
      })
      newPortfolio = newPortfolio.map((a) => {
        return Object.assign({}, a, {
          percentage: toPercentage(a.fiat, totalFiat)
        })
      }).sort((a, b) => a.fiat.minus(b.fiat).toNumber()).reverse()
      newPortfolio = fixPercentageRounding(newPortfolio, totalFiat)
      const totalChange = totalFiat.minus(totalFiat24hAgo).div(totalFiat24hAgo).times(100)
      dispatch(setPortfolio({
        total: totalFiat,
        total24hAgo: totalFiat24hAgo,
        totalChange: totalChange,
        // pending: pendingFiat,
        list: newPortfolio
      }))
      dispatch(loadingPortfolio(false))
    })
    .catch((err) => {
      log.error(err)
      dispatch(loadingPortfolio(false))
      throw err
    })
}

export const getAssets = () => (dispatch) => {
  return fetchGet(`${config.siteUrl}/app/assets`)
    .then((assets) => {
      dispatch(setAssets(assets))
      return assets
    })
    .catch((err) => {
      log.error(err)
      throw err
    })
}

export const getMarketInfo = (pair) => () => {
  return fetchGet(`${config.apiUrl}/marketinfo/${pair}`)
    .then((data) => {
      if (data.error) throw new Error(data.error)

      return data
    })
}

export const postExchange = (info) => () => {
  return fetchPost(`${config.apiUrl}/shift`, info)
    .then((data) => {
      if (data.error || !data.orderId) throw new Error(data.error)

      return data
    })
    .catch((err) => {
      log.error(err)
      const errMsg = filterErrors(err)
      throw new Error(errMsg)
    })
}

export const getOrderStatus = (depositSymbol, receiveSymbol, address, timestamp) => (dispatch) => {
  let url = `${config.apiUrl}/txStat/${address}`
  if (timestamp) url += `?after=${timestamp}`
  return fetchGet(url)
    .then((data) => {
      log.info('order status receive', data)
      // if (data.error || !data.status) throw new Error(data.error)

      const order = filterObj(['status', 'transaction', 'outgoingCoin', 'error'], data)

      dispatch(updateSwapOrder(depositSymbol, receiveSymbol, order))
      return data
    })
    .catch((err) => {
      log.error(err)
      const errMsg = filterErrors(err)
      throw new Error(errMsg)
    })
}

export const getSwundle = (address, isMocking) => (dispatch) => {
  let url = `${config.apiUrl}/swundle/${address}`
  fetchGet(url)
  .then((data) => {
    if (data.result && data.result.swap) {
      dispatch(restoreSwundle(data.result.swap, address, isMocking))
    }
  })
  .catch(log.error)
}

export const postSwundle = (address, swap) => () => {
  const url = `${config.apiUrl}/swundle/${address}`
  fetchPost(url, { swap })
  .catch(log.error)
}

export const removeSwundle = (address) => () => {
  clearSwap(address)
  const url = `${config.apiUrl}/swundle/${address}`
  fetchDelete(url)
  .catch(log.error)
}
