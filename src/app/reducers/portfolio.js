import { updateObjectInArray } from 'Utilities/helpers'

const initialState = {
  list: []
}

const getIndex = (list, symbol) => {
  return list.findIndex((a) => a.symbol === symbol)
}

const setPortfolioItem = (originalList, symbol, item) => {
  const assetIx = getIndex(originalList, symbol)
  if (assetIx >= 0) {
    return updateObjectInArray(originalList, {
      index: assetIx,
      item: Object.assign({}, originalList[assetIx], item)
    })
  }
  return originalList
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
  case 'RESET_ALL':
  case 'RESET_PORTFOLIO':
    return initialState
  case 'SET_PORTFOLIO':
    return { ...state, ...payload }
  case 'SET_PORTFOLIO_ITEM':
    return { ...state, list: setPortfolioItem(state.list, payload.symbol, payload.item) }
  case 'LOADING_PORTFOLIO':
    return { ...state, loading: payload }
  case 'SET_CURRENT_WALLET':
    return { ...state, wallet: payload.id }
  default:
    return state
  }
}
