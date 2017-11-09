import { updateObjectInArray } from 'Utilities/helpers'

const initialState = {
  list: []
}

const getIndex = (list, symbol) => {
  return list.findIndex((a) => a.symbol === symbol)
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'RESET_ALL':
    case 'RESET_PORTFOLIO':
      return initialState
    case 'SET_PORTFOLIO':
      return action.payload
    case 'SET_PORTFOLIO_ITEM':
      const assetIx = getIndex(state.list, action.payload.symbol)
      if (assetIx >= 0) {
        return Object.assign({}, state, {
          list: updateObjectInArray(state.list, {
            index: assetIx,
            item: Object.assign({}, state.list[assetIx], action.payload.item)
          })
        })
      } else {
        return state
      }
    case 'LOADING_PORTFOLIO':
      return Object.assign({}, state, { loading: action.payload })
    default:
      return state
  }
}
