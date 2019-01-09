import { createItemSelector, fieldSelector } from 'Utilities/selector'

export const getOrdersState = ({ orders }) => orders

export const areOrdersLoading = createItemSelector(getOrdersState, fieldSelector('ordersLoading'))
export const areAllOrdersLoaded = createItemSelector(getOrdersState, fieldSelector('allOrdersLoaded'))
