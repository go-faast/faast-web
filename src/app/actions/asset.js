import { uniq } from 'lodash'
import { newScopedCreateAction } from 'Utilities/action'
import { localStorageSetJson, localStorageGetJson } from 'Utilities/storage'
import config from 'Config'

export * from 'Common/actions/asset'

const createAction = newScopedCreateAction(__filename)

export const watchlistUpdated = createAction('WATCHLIST_UPDATED', (symbol, onWatchlist) => ({ symbol, onWatchlist }))

export const handleWatchlist = (symbol) => (dispatch) => {
  let watchlist = localStorageGetJson('watchlist') || config.defaultWatchlist
  const index = watchlist.indexOf(symbol)
  let added
  if (index < 0) {
    watchlist.unshift(symbol)
    added = true
  } else {
    watchlist.splice(index, 1)
    added = false
  }
  watchlist = uniq(watchlist)
  localStorageSetJson('watchlist', watchlist)
  dispatch(watchlistUpdated(symbol, added))
}
