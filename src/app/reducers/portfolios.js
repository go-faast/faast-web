import { createReducer } from 'redux-act'
import { updateObjectInArray, mapValues, merge } from 'Utilities/helpers'
import { resetAll } from 'Actions/redux'
import {
  portfolioAdded, portfolioRemoved, allPortfoliosRemoved, portfolioWalletAdded,
  portfolioWalletRemoved, setPortfolioItem
} from 'Actions/portfolio'
import { walletRemoved, allWalletsRemoved } from 'Actions/wallet'

const initialPortfolioState = {
  wallets: [],
  list: [],
}

const initialState = {}

const getAssetIndex = (list, symbol) => {
  return list.findIndex((a) => a.symbol === symbol)
}

const mergeAssetIntoList = (originalList, symbol, item) => {
  const assetIx = getAssetIndex(originalList, symbol)
  if (assetIx >= 0) {
    return updateObjectInArray(originalList, {
      index: assetIx,
      item: Object.assign({}, originalList[assetIx], item)
    })
  }
  return originalList
}

export default createReducer({
  [resetAll]: () => initialState,
  [allPortfoliosRemoved]: () => initialState,
  [portfolioRemoved]: (state, { id }) => ({ ...state, [id]: undefined }),
  [portfolioAdded]: (state, portfolio) => merge(state, {
    [portfolio.id]: {
      ...initialPortfolioState,
      ...portfolio
    }
  }),
  [portfolioWalletAdded]: (state, { portfolioId, walletId }) => merge(state, {
    [portfolioId]: {
      wallets: { $union: [walletId] }
    }
  }),
  [portfolioWalletRemoved]: (state, { portfolioId, walletId }) => merge(state, {
    [portfolioId]: {
      wallets: { $without: [walletId] }
    }
  }),
  [setPortfolioItem]: (state, { portfolioId, symbol, item }) => merge(state, {
    [portfolioId]: {
      list: mergeAssetIntoList(state.list, symbol, item)
    }
  }),
  [walletRemoved]: (state, { id }) => mapValues(state, (portfolio) => ({
    ...portfolio,
    wallets: portfolio.wallets.filter((walletId) => walletId !== id),
  })),
  [allWalletsRemoved]: (state) => mapValues(state, (portfolio) => ({
    ...portfolio,
    wallets: [],
  }))
}, initialState)