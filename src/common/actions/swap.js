import Faast from 'Services/Faast'

export const getSwapsByAddress = (walletId, page = 1, limit = 100) => () => {
  return Faast.fetchOrders(walletId, page, limit, false)
    .then((orders) => orders)
}

export const getSwapByOrderId = (swapId) => () => {
  return Faast.fetchSwap(swapId, false)
    .then((swap) => swap)
}