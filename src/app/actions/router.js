import { push, replace } from 'react-router-redux'
import equal from 'fast-deep-equal'

import { getRouterLocation } from 'Selectors'

const updateQueryString = (historyAction) => (newParams) =>
  (dispatch, getState) => {
    const current = getRouterLocation(getState())
    const updated = {
      ...current,
      ...newParams,
    }
    if (!equal(current, updated)) {
      dispatch(historyAction({
        search: updated.search
      }))
    }
    return Promise.resolve()
  }

export const removeQueryString = () =>
  (dispatch, getState) => {
    const current = getRouterLocation(getState())
    dispatch(push({
      pathname: current.pathname,
      search: ''
    }))
    return Promise.resolve()
  }

export const updateQueryStringPush = updateQueryString(push)
export const updateQueryStringReplace = updateQueryString(replace)