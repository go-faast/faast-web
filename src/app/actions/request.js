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

export const getETHBalance = (address, batch) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      if (batch) {
        batch.add(
          window.faast.web3.eth.getBalance.request(address, 'latest', (err, result) => {
            if (err) return reject(err)

            resolve(result)
          })
        )
      } else {
        window.faast.web3.eth.getBalance(address, 'latest')
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          reject(err)
        })
      }
    })
  )
}

export const getTokenBalance = (symbol, contractAddress, walletAddress, batch) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      const data = tokenBalanceData(walletAddress)
      if (batch) {
        batch.add(
          window.faast.web3.eth.call.request({
            to: contractAddress,
            data
          }, 'latest', (err, result) => {
            if (err) return reject(err)

            resolve(toBigNumber(result))
          })
        )
      } else {
        window.faast.web3.eth.call({
          to: contractAddress,
          data
        }, 'latest')
        .then((result) => {
          resolve(toBigNumber(result))
        })
        .catch((err) => {
          reject(err)
        })
      }
    })
  )
}

export const getBalance = (asset, walletAddress, mock, batch) => {
  return (dispatch) => {
    if (mock && mock[asset.symbol] && mock[asset.symbol].hasOwnProperty('balance')) {
      return Promise.resolve(toSmallestDenomination(mock[asset.symbol].balance, asset.decimals))
    }
    if (asset.symbol === 'ETH') {
      return dispatch(getETHBalance(walletAddress, batch))
    } else {
      return dispatch(getTokenBalance(asset.symbol, asset.contractAddress, walletAddress, batch))
    }
  }
}

export const getFiatPrice = (symbol, mock) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      if (mock && mock[symbol] && mock[symbol].hasOwnProperty('price')) {
        return resolve({ price_usd: toBigNumber(mock[symbol].price) })
      }
      fetchGet(`${config.siteUrl}/app/portfolio-price/${symbol}`)
      .then((data) => {
        if (data.error) throw new Error(data.error)

        resolve(data)
      })
      .catch(reject)
    })
  )
}

export const getPriceChart = (symbol) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      fetchGet(`${config.siteUrl}/app/portfolio-chart/${symbol}`)
      .then((data) => {
        if (data.error) throw new Error(data.error)

        resolve(data)
      })
      .catch(reject)
    })
  )
}

export const getFiatPrices = (list, mock) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      fetchGet(`${config.siteUrl}/app/portfolio-price`)
      .then((data) => {
        if (data.error) throw new Error(data.error)

        resolve(list.map(a => {
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
        }))
      })
      .catch((e) => {
        log.error(e)
        resolve(list)
      })
    })
  )
}

const preparePortfolio = (assets, mock) => {
  return (dispatch) => {
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
}

export const getBalances = (assets, portfolio, walletAddress, mock) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      let portfolioList = portfolio.list
      if (!portfolioList || !portfolioList.length) {
        dispatch(loadingPortfolio(true))
        portfolioList = dispatch(preparePortfolio(assets, mock))
      }
      dispatch(getFiatPrices(portfolioList, mock))
      .then((p) => {
        const batch = new window.faast.web3.BatchRequest()
        const promises = Promise.all(p.map((a) => {
          return new Promise((resolve, reject) => {
            dispatch(getBalance(a, walletAddress, mock, batch))
            .then((b) => {
              const converted = toMainDenomination(b, a.decimals)
              resolve(Object.assign({}, a, { balance: converted }))
            })
            .catch((e) => {
              resolve(a)
            })
          })
        }))
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
        newPortfolio = newPortfolio.map((b, i) => {
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
        resolve()
      })
      .catch((err) => {
        log.error(err)
        dispatch(loadingPortfolio(false))
        reject(err)
      })
    })
  )
}

export const getAssets = () => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      fetchGet(`${config.siteUrl}/app/assets`)
      .then((assets) => {
        dispatch(setAssets(assets))
        resolve(assets)
      })
      .catch((err) => {
        log.error(err)
        reject(err)
      })
    })
  )
}

export const getMarketInfo = (pair) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      fetchGet(`${config.siteUrl}/app/portfolio-marketinfo?pair=${pair}`)
      .then((data) => {
        if (data.error) throw new Error(data.error)

        resolve(data)
      })
      .catch(reject)
    })
  )
}

export const postExchange = (info) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      fetchPost(`${config.siteUrl}/app/portfolio-exchange`, info)
      .then((data) => {
        if (data.error || !data.orderId) throw new Error(data.error)

        resolve(data)
      })
      .catch((err) => {
        log.error(err)
        const errMsg = filterErrors(err)
        reject(new Error(errMsg))
      })
    })
  )
}

export const getOrderStatus = (depositSymbol, receiveSymbol, address) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
      const pair = depositSymbol.toLowerCase() + '_' + receiveSymbol.toLowerCase()
      fetchGet(`${config.siteUrl}/app/portfolio-order/${address}?pair=${pair}`)
      .then((data) => {
        log.info('order status receive', data)
        // if (data.error || !data.status) throw new Error(data.error)

        const order = filterObj(['status', 'transaction', 'outgoingCoin', 'error'], data)

        dispatch(updateSwapOrder(depositSymbol, receiveSymbol, order))
        resolve(data)
      })
      .catch((err) => {
        log.error(err)
        const errMsg = filterErrors(err)
        reject(new Error(errMsg))
      })
    })
  )
}
