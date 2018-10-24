import { newScopedCreateAction } from 'Utilities/action'
import log from 'Log'
import Faast from 'Services/Faast'
import { isRateStale } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const rateLoading = createAction('RATE_LOADING', (pair) => ({ pair }))
export const rateUpdated = createAction('RATE_UPDATED', (pair, data) => ({ pair, ...data }))
export const rateError = createAction('RATE_ERROR', (pair, error) => ({ pair, error }))

export const retrievePairData = (pair) => (dispatch, getState) => {
  if (!isRateStale(getState(), pair)) {
    return
  }
  dispatch(rateLoading(pair))
  Faast.fetchPairData(pair)
    .then((data) => { 
      dispatch(rateUpdated(pair, data))
    })
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${pair} data`
      dispatch(rateError(pair, message))
      throw new Error(message)
    })
}
