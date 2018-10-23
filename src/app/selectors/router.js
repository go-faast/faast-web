import { createSelector } from 'reselect'
import { getLocation } from 'react-router-redux'
import qs from 'qs'

export const getRouterLocation = getLocation
export const getRouterQueryString = createSelector(getRouterLocation, ({ search }) => search)
export const getRouterQueryParams = createSelector(getRouterQueryString,
  (queryString) => qs.parse(queryString, { ignoreQueryPrefix: true }))
