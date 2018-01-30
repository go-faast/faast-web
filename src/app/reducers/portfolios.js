import { createReducer } from 'redux-act'
import merge from 'lodash.merge'
import union from 'lodash.union'
import { updateObjectInArray } from 'Utilities/helpers'
import { resetAll } from 'Actions/redux'
import {
  portfolioAdded, portfolioRemoved, allPortfoliosRemoved, portfolioWalletAdded,
  setPortfolio, setPortfolioItem
} from 'Actions/portfolio'

const initialPortfolioState = {
  wallets: [],
  list: []
}

const initialState = {
  default: {
    id: 'default',
    ...initialPortfolioState
  }
}

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
  [portfolioAdded]: (state, portfolio) => merge({}, state, {
    [portfolio.id]: {
      ...initialPortfolioState,
      ...portfolio
    }
  }),
  [portfolioWalletAdded]: (state, { portfolioId, walletId }) => merge({}, state, {
    [portfolioId]: {
      wallets: union(state[portfolioId].wallets, [walletId])
    }
  }),
  [setPortfolio]: (state, portfolio) => merge({}, state, {
    [portfolio.id]: portfolio
  }),
  [setPortfolioItem]: (state, { portfolioId, symbol, item }) => merge({}, state, {
    [portfolioId]: {
      list: mergeAssetIntoList(state.list, symbol, item)
    }
  }),
}, initialState)