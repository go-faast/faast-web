import { newScopedCreateAction } from 'Utilities/action'
import { getRate, isRateStale, isRateLoading } from 'Selectors/currency'
import log from 'Log'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const rateLoading = createAction('CURRENCY_LOADING', (symbol) => ({ symbol }))
export const rateUpdated = createAction('CURRENCY_UPDATED', (symbol, data) => ({ symbol, ...data }))
export const rateError = createAction('CURRENCY_ERROR', (symbol, error) => ({ symbol, error }))
export const updateSymbol = createAction('UPDATE_CURRENCY_SYMBOL')

export const setCurrencySymbol = (symbol) => (dispatch) => Promise.resolve()
  .then(() => {
    dispatch(updateSymbol(symbol))
    localStorage.setItem('currency_symbol', symbol)
  })

export const retrieveCurrencyRate = (symbol) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    console.log('symbol', symbol)
    if (!isRateStale(getState(), symbol) || isRateLoading(getState(), symbol)) {
      return getRate(getState(), symbol)
    }
    dispatch(rateLoading(symbol))
    return Faast.getInternationalRate(symbol)
      .then((data) => { 
        console.log('got back', data)
        return dispatch(rateUpdated(symbol, data)).payload
      })
      .catch((e) => {
        log.error(e)
        const message = `Failed to load ${symbol} data`
        dispatch(rateError(symbol, message))
        throw new Error(message)
      })
  })