import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'
import { getNewsArticlesArray } from 'Selectors/news'

const createAction = newScopedCreateAction(__filename)

export const updateNews = createAction('UPDATE_NEWS_BY_SYMBOL')
export const loadingNews = createAction('LOADING_NEWS')

export const fetchNews = (symbols) => (dispatch, getState) => Promise.resolve()
  .then(async () => {
    // if (!areNewsArticlesStale(getState())) return
    dispatch(loadingNews(true))
    const alreadyLoadedNews = getNewsArticlesArray(getState())
    symbols = symbols && symbols.join()
    const res = await Faast.fetchCoinNews(symbols)
    if (res && res.results) {
      res.results.forEach(r => {
        if (!alreadyLoadedNews.some(a => a.id === r.id)) {
          dispatch(updateNews(r))
        }
      })
      dispatch(loadingNews(false))
    } else {
      dispatch(loadingNews(false))
    }
  })
  .catch((e) => {
    dispatch(loadingNews(false))
    log.error(e)
    throw new Error('Error fetching coin news, please refresh the page.')
  })
