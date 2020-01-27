import { newScopedCreateAction } from 'Utilities/action'
import { localStorageSetJson } from 'Utilities/storage'
import { getRate, isRateStale, isRateLoading, getSelectedCurrency } from 'Selectors/currency'
import log from 'Log'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const rateLoading = createAction('CURRENCY_LOADING', (label) => ({ label }))
export const rateUpdated = createAction('CURRENCY_UPDATED', (label, rate) => ({ label, rate }))
export const rateError = createAction('CURRENCY_ERROR', (label, error) => ({ label, error }))
export const updateSymbol = createAction('UPDATE_CURRENCY_SYMBOL')
export const updatePreviousCurrency = createAction('UPDATE_PREVIOUS_CURRENCY')

export const setCurrencySymbol = (currency) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    const symbol = currency && currency.label || 'USD'
    const previousCurrency = getSelectedCurrency(getState())
    dispatch(updatePreviousCurrency(previousCurrency))
    dispatch(updateSymbol(currency))
    dispatch(retrieveCurrencyRate(symbol))
    localStorageSetJson('currency_symbol', currency)
  })

export const retrieveCurrencyRate = (symbol) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    if (!isRateStale(getState(), symbol) || isRateLoading(getState(), symbol)) {
      return getRate(getState(), symbol)
    }
    dispatch(rateLoading(symbol))
    return Faast.getInternationalRate(symbol)
      .then((data) => { 
        return dispatch(rateUpdated(symbol, data)).payload
      })
      .catch((e) => {
        log.error(e)
        const message = `Failed to load ${symbol} data`
        dispatch(rateError(symbol, message))
        throw new Error(message)
      })
  })