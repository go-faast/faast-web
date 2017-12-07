import { tokenBalanceData } from 'Utilities/wallet'
import {
  toBigNumber,
  toSmallestDenomination,
  toMainDenomination,
  toUnit,
  toPercentage
} from 'Utilities/convert'
import { fixPercentageRounding, filterErrors, filterObj } from 'Utilities/helpers'
import { fetchGet, fetchPost } from 'Utilities/fetch'
import log from 'Utilities/log'
import { loadingPortfolio, setPortfolio, setAssets, updateSwapOrder } from 'Actions/redux'
import config from 'Config'

const batchRequest = (batch, batchableFn, ...fnArgs) => {
  if (batch) {
    return new Promise((resolve, reject) => {
      batch.add(
        batchableFn.request(...fnArgs, (err, result) => {
          if (err) return reject(err)

          resolve(result)
        })
      )
    })
  }
  return batchableFn(...fnArgs)
}

export const getETHBalance = (address, batch) => () => {
  return batchRequest(batch, window.faast.web3.eth.getBalance, address, 'latest')
}

export const getTokenBalance = (symbol, contractAddress, walletAddress, batch) => () => {
  return batchRequest(batch, window.faast.web3.eth.call, {
    to: contractAddress,
    data: tokenBalanceData(walletAddress)
  }, 'latest').then(toBigNumber)
}

export const getBalance = (asset, walletAddress, mock, batch) => (dispatch) => {
  if (mock && mock[asset.symbol] && mock[asset.symbol].hasOwnProperty('balance')) {
    return Promise.resolve(toSmallestDenomination(mock[asset.symbol].balance, asset.decimals))
  }
  if (asset.symbol === 'ETH') {
    return dispatch(getETHBalance(walletAddress, batch))
  } else {
    return dispatch(getTokenBalance(asset.symbol, asset.contractAddress, walletAddress, batch))
  }
}

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
          change24: toBigNumber(priceData.percent_change_24h || 0)
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
  const portfolio = []
  portfolio.push(assets.find((a) => a.symbol === 'ETH'))
  const tokens = assets.filter((a) => a.ERC20)
  return portfolio.concat(tokens).map((a) => {
    const assetObj = {
      symbol: a.symbol,
      name: a.name,
      decimals: a.decimals,
      infoUrl: a.infoUrl
    }
    if (a.contractAddress) assetObj.contractAddress = a.contractAddress
    if (mock && mock[a.symbol] && mock[a.symbol].price) {
      assetObj.price = mock[a.symbol].price
    }
    return assetObj
  })
}

export const getBalances = (assets, portfolio, walletAddress, mock) => (dispatch) => {
  let portfolioList = portfolio.list
  if (!portfolioList || !portfolioList.length) {
    dispatch(loadingPortfolio(true))
    portfolioList = dispatch(preparePortfolio(assets, mock))
  }
  return dispatch(getFiatPrices(portfolioList, mock))
    .then((p) => {
      const batch = new window.faast.web3.BatchRequest()
      const promises = Promise.all(p.map((a) => 
        dispatch(getBalance(a, walletAddress, mock, batch))
          .then((b) => {
            const converted = toMainDenomination(b, a.decimals)
            return Object.assign({}, a, { balance: converted })
          })
          .catch(() => a)))
      batch.execute()
      return promises
    })
    .then((p) => {
      let totalFiat = toBigNumber(0)
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
