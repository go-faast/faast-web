import { newScopedCreateAction } from 'Utilities/action'
import log from 'Log'
import Faast from 'Services/Faast'
import { getRate, isRateStale, isRateLoading } from 'Common/selectors/rate'

const createAction = newScopedCreateAction(__filename)

export const rateLoading = createAction('RATE_LOADING', (pair) => ({ pair }))
export const rateUpdated = createAction('RATE_UPDATED', (pair, data) => ({ pair, ...data }))
export const rateError = createAction('RATE_ERROR', (pair, error) => ({ pair, error }))

export const retrievePairData = (from, to, depositAmount, withdrawalAmount) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    if (typeof from !== 'string') {
      throw new Error(`Cannot retrieve pair data for ${from}`)
    }
    let pair = from
    if (to && !pair.includes('_')) {
      pair = `${from}_${to}`.toLowerCase()
    }
    if (!isRateStale(getState(), pair) || isRateLoading(getState(), pair)) {
      return getRate(getState(), pair)
    }
    dispatch(rateLoading(pair))
    return Faast.fetchPairData(pair, depositAmount, withdrawalAmount)
      .then((data) => { 
        return dispatch(rateUpdated(pair, data)).payload
      })
      .catch((e) => {
        log.error(e)
        const message = `Failed to load ${pair} data`
        dispatch(rateError(pair, message))
        throw new Error(message)
      })
  })
