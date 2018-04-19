import { createSelector } from 'reselect'

const getRouterState = ({ router }) => router

export const getRouterLocation = createSelector(getRouterState, ({ location }) => location)