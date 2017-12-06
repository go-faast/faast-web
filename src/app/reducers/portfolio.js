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

export default (state = initialState, action) => {
  switch (action.type) {
  case 'RESET_ALL':
  case 'RESET_PORTFOLIO':
    return initialState
  case 'SET_PORTFOLIO':
    return action.payload
  case 'SET_PORTFOLIO_ITEM':
    return Object.assign({}, state, {
      list: setPortfolioItem(state.list, action.payload.symbol, action.payload.item)
    })
  case 'LOADING_PORTFOLIO':
    return Object.assign({}, state, { loading: action.payload })
  default:
    return state
  }
}
