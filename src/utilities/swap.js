import { toUnit, toPrecision } from 'Utilities/convert'

export const getSwapStatus = (swap) => {
  if (swap.error) {
    if (swap.error.message && swap.error.message.startsWith('Returned error: Insufficient funds')) {
      return {
        status: 'error',
        details: 'insufficient funds'
      }
    }
    return {
      status: 'error',
      details: 'unable to send transaction'
    }
  }
  if (swap.fee == null) {
    return {
      status: 'working',
      details: 'fetching swap details'
    }
  }
  if (swap.order == null) {
    return {
      status: 'working',
      details: 'creating swap order'
    }
  }
  if (swap.order.error) {
    return {
      status: 'error',
      details: typeof swap.order.error === 'string' ? swap.order.error : 'swap order error'
    }
  }
  if (swap.tx == null) {
    return {
      status: 'working',
      details: 'generating transaction'
    }
  }
  if (!swap.tx.signed) {
    return {
      status: 'working',
      details: 'waiting for transaction to be signed'
    }
  }
  if (!swap.tx.sent) {
    return {
      status: 'working',
      details: 'sending signed transaction'
    }
  }
  if (swap.tx.receipt == null) {
    return {
      status: 'working',
      details: 'waiting for transaction receipt'
    }
  }
  // number of confirmations doesn't correlate to anything here
  // if ((swap.order.status == null || swap.order.status === 'no_deposits') && (swap.tx.confirmations == null || swap.tx.confirmations < 3)) {
  //   return {
  //     status: 'working',
  //     details: 'waiting for confirmations'
  //   }
  // }
  if (swap.order.status == null || swap.order.status !== 'complete') {
    return {
      status: 'working',
      details: 'processing swap'
    }
  }
  return {
    status: 'complete',
    details: 'complete'
  }
}

export const statusAllSwaps = (swapList) => {
  if (!swapList || !swapList.length) {
    return 'unavailable'
  }
  if (swapList.some(({ tx }) => !tx)) {
    return 'unspecified'
  }
  if (swapList.some(({ tx }) => !tx.signed)) {
    return 'unsigned'
  }
  if (swapList.some(({ tx }) => !tx.sent)) {
    return 'unsent'
  }
  if (swapList.some(({ tx }) => !tx.receipt)) {
    if (swapList.some(({ restored }) => !restored)) {
      return 'pending_receipts'
    } else {
      return 'pending_receipts_restored'
    }
  }
  if (swapList.every(({ order }) => order && (order.status === 'complete' || order.status === 'failed'))) {
    return 'finalized'
  }
  return 'pending_orders'
}

export const estimateReceiveAmount = (swap, asset) => {
  const { fee, rate, sendUnits } = (swap || {})
  if (fee && rate && sendUnits) {
    const converted = toUnit(sendUnits, rate, asset.decimals)
    return toPrecision(converted.minus(fee), asset.decimals)
  }
}
