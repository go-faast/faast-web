import { createReducer } from 'redux-act'
import { updateObjectInArray } from 'Utilities/helpers'
import { resetAll } from 'Actions/redux'
import {
  portfolioAdded, setCurrentPortfolio, resetPortfolio, setPortfolio, setPortfolioItem, setPortfolioLoading
} from 'Actions/portfolio'

const initialState = {
  list: []
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
  [resetPortfolio]: () => initialState,
  [setPortfolio]: (state, payload) => ({ ...state, ...payload }),
  [setPortfolioItem]: (state, { symbol, item }) => ({
    ...state,
    list: mergeAssetIntoList(state.list, symbol, item)
  }),
  [setPortfolioLoading]: (state, isLoading) => ({ ...state, loading: isLoading }),
  [setCurrentPortfolio]: (state, { id }) => ({ ...state, current: id }),
  [portfolioAdded]: (state, { id }) => ({ ...state, current: state.current || id })
}, initialState)
