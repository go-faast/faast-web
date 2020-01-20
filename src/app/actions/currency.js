import { newScopedCreateAction } from 'Utilities/action'
import { localStorageSetJson } from 'Utilities/storage'
import { getRate, isRateStale, isRateLoading } from 'Selectors/currency'
import log from 'Log'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const rateLoading = createAction('CURRENCY_LOADING', (label) => ({ label }))
export const rateUpdated = createAction('CURRENCY_UPDATED', (label, data) => ({ label, ...data }))
export const rateError = createAction('CURRENCY_ERROR', (label, error) => ({ label, error }))
export const updateSymbol = createAction('UPDATE_CURRENCY_SYMBOL')

export const setCurrencySymbol = (currency) => (dispatch) => Promise.resolve()
  .then(() => {
    dispatch(updateSymbol(currency))
    localStorageSetJson('currency_symbol', currency)
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