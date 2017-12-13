import BigNumber from 'bignumber.js'
import { updateObjectInArray } from 'Utilities/helpers'

const initialState = []

const getIndex = (list, symbol) => {
  return list.findIndex((a) => a.symbol === symbol)
}

const insertIntoReceive = (state, depSymbol, recSymbol, toInsert, key) => {
  const depIx = getIndex(state, depSymbol)
  const recIx = getIndex(state[depIx].list, recSymbol)
  let keyData
  if (key) {
    if (!state[depIx].list[recIx][key]) state[depIx].list[recIx][key] = {}
    keyData = state[depIx].list[recIx][key]
  }
  if (depIx >= 0 && recIx >= 0) {
    return updateObjectInArray(state, {
      index: depIx,
      item: Object.assign({}, state[depIx], {
        list: updateObjectInArray(state[depIx].list, {
          index: recIx,
          item: Object.assign(
            {},
            state[depIx].list[recIx],
            keyData ? { [key]: Object.assign({}, keyData, toInsert) } : toInsert
          )
        })
      })
    })
  } else {
    return state
  }
}

export default (state = initialState, action) => {
  let depIx
  let recIx
  switch (action.type) {
  case 'RESET_ALL':
  case 'RESET_SWAP':
    return initialState
  case 'SET_SWAP':
    return action.payload
    // case 'SET_SWAP_ITEM':
      // return Object.assign({}, state, { isFetching: false, list: updateObjectInArray(state.list, action.payload) })
  case 'ADD_SWAP_DEPOSIT':
    return state.concat([{ symbol: action.payload, list: [] }])
  case 'REMOVE_SWAP_DEPOSIT':
    depIx = getIndex(state, action.payload)
    if (depIx >= 0) {
      return state.slice(0, depIx).concat(state.slice(depIx + 1))
    } else {
      return state
    }
  case 'ADD_SWAP_RECEIVE':
    depIx = getIndex(state, action.payload.depositSymbol)
    if (depIx >= 0) {
      return updateObjectInArray(state, {
        index: depIx,
        item: Object.assign({}, state[depIx], {
          list: state[depIx].list.concat([{
            symbol: action.payload.receiveSymbol,
            unit: new BigNumber(0)
          }])
        })
      })
    } else {
      return state
    }
  case 'REMOVE_SWAP_RECEIVE':
    depIx = getIndex(state, action.payload.depositSymbol)
    recIx = getIndex(state[depIx].list, action.payload.receiveSymbol)
    if (depIx >= 0 && recIx >= 0) {
      return updateObjectInArray(state, {
        index: depIx,
        item: Object.assign({}, state[depIx], {
          list: state[depIx].list.slice(0, recIx).concat(state[depIx].list.slice(recIx + 1))
        })
      })
    } else {
      return state
    }
  case 'INSERT_SWAP_DATA':
    return insertIntoReceive(
        state,
        action.payload.depositSymbol,
        action.payload.receiveSymbol,
        action.payload.data
      )
  case 'UPDATE_SWAP_TX':
    return insertIntoReceive(
        state,
        action.payload.depositSymbol,
        action.payload.receiveSymbol,
        action.payload.data,
        'tx'
      )
  case 'UPDATE_SWAP_ORDER':
    return insertIntoReceive(
        state,
        action.payload.depositSymbol,
        action.payload.receiveSymbol,
        action.payload.data,
        'order'
      )
    // case 'INSERT_SWAP_ORDER':
    //   return insertIntoReceive(state, action.payload.depositSymbol, action.payload.receiveSymbol, {
    //     order: action.payload.order
    //   })
  default:
    return state
  }
}
