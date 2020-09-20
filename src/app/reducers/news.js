import { createReducer } from 'redux-act'

import { updateNews, loadingNews } from 'Actions/news'
import { createUpserter } from 'Utilities/helpers'

const initialState = {
  loading: false,
  lastUpdated: undefined,
  data: {}
}

const initialNewsState = {
}

const upsert = createUpserter('id', initialNewsState)

export default createReducer({
  [loadingNews]: (state, loading) => ({ ...state, loading }),
  [updateNews]: (state, article) => {
    return ({
      ...state,
      data: upsert(state.data, {
        ...article
      }),
    })
  },
}, initialState)
