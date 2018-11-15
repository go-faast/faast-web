import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'
import { isFunction } from 'lodash'

export { createSelector, createCachedSelector }

/** Creates a new selector by passing state and args into originalSelector */
export const currySelector = (originalSelector, ...args) => (state) => 
  originalSelector(state, ...args.map((arg) => 
    isFunction(arg) ? arg(state) : arg))
    
/** Selector that returns the first non-state argument passed to it */
export const selectItemId = (state, id) => id

const selectItemCacheKey = (state, args) => typeof args === 'object' ? JSON.stringify(args) : args

/** Creates a cached selector that accepts an item ID as an arg */
export const createItemSelector = (...createSelectorArgs) => createCachedSelector(...createSelectorArgs)(selectItemCacheKey)

export const fieldSelector = (fieldName, fallbackValue = null) => (o) =>
  typeof o === 'object' && o !== null ? o[fieldName] : fallbackValue
