import { createSelector } from 'reselect'
import { createItemSelector, selectItemId } from 'Utilities/selector'
import { sortByStringDate } from 'Utilities/helpers'
import { getCurrentWalletHeldSymbols } from 'Selectors/portfolio'
import { getWatchlistSymbols } from 'Selectors/asset'

export const getNewsState = ({ news }) => news

const handleSelectArticles = (articles, symbols) => {
  if (symbols && symbols.length > 0) {
    return articles && sortByStringDate(articles.filter(a => a.currencies && a.currencies.some(c => symbols.indexOf(c.code) >= 0)), 'published_at')
  } else {
    return sortByStringDate(articles, 'published_at')
  }
}

// News selectors
export const areNewsArticlesStale = createSelector(getNewsState, (state) => {
  if (state.data && state.data.length > 0) {
    const { lastUpdated } = state
    const isStale = (Date.now() - lastUpdated) >= 300000
    return isStale
  } else {
    return true
  }
})
export const isNewsLoading = createSelector(getNewsState, (state) => state.loading)
export const getNewsArticles = createSelector(getNewsState, (state) => state.data)
export const getNewsArticlesArray = createSelector(getNewsArticles, Object.values)
export const getNewsSymbols = createSelector(getCurrentWalletHeldSymbols, getWatchlistSymbols, (balances, watchlist) => {
  return balances.concat(watchlist).filter((sym, i, a) => a.indexOf(sym) === i)
})
export const getNewsArticlesBySymbols = createItemSelector(getNewsArticlesArray, selectItemId, (articles, symbols) => 
  handleSelectArticles(articles, symbols))
export const getNewsArticlesForCurrentWallet = createSelector(getNewsArticlesArray, getCurrentWalletHeldSymbols, (articles, symbols) => {
  return handleSelectArticles(articles, symbols)
})
export const getNewsArticlesForUser = createSelector(getNewsArticlesArray, getNewsSymbols, (articles, symbols) => {
  return handleSelectArticles(articles, symbols)
})
