import { createReducer } from 'redux-act'
import { resetAll } from 'Actions/redux'
import {
  setCurrentPortfolio, portfolioAdded, portfolioRemoved
} from 'Actions/portfolio'

const initialState = {
  current: 'default'
}

export default createReducer({
  [resetAll]: () => initialState,
  [setCurrentPortfolio]: (state, { id }) => ({ ...state, current: id }),
  [portfolioAdded]: (state, { id }) => ({ ...state, current: state.current || id }),
  [portfolioRemoved]: (state, { id }) => (state.current === id ? ({ ...state, current: null }) : state),
}, initialState)
