import Faast from 'Services/Faast'
import { toNumber } from 'Utilities/numbers'

const convertBN = (order) => {
  return ({
    ...order,
    depositAmount: toNumber(order.depositAmount),
    receiveAmount: toNumber(order.receiveAmount),
    spotRate: toNumber(order.spotRate),
    rate: toNumber(order.rate),
    amountDeposited: toNumber(order.amountDeposited),
    amountWithdrawn: toNumber(order.amountWithdrawn)
  })
}

export const getSwapsByAddress = (walletId, page = 1, limit = 100) => () => {
  return Faast.fetchOrders(walletId, page, limit)
    .then((orders) => {
      return orders.map(convertBN)
    })
}

export const getSwapByOrderId = (swapId) => () => {
  return Faast.fetchSwap(swapId)
    .then((swap) => convertBN(swap))
}