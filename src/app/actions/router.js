import { push, replace } from 'react-router-redux'
import equal from 'fast-deep-equal'
import qs from 'qs'

import { getRouterQueryParams } from 'Selectors'

const updateQueryString = (historyAction) => (newParams) =>
  (dispatch, getState) => {
    const current = getRouterQueryParams(getState())
    const updated = {
      ...current,
      ...newParams,
    }
    if (!equal(current, updated)) {
      dispatch(historyAction({
        search: qs.stringify(updated)
      }))
    }
    return Promise.resolve()
  }

export const updateQueryStringPush = updateQueryString(push)
export const updateQueryStringReplace = updateQueryString(replace)
