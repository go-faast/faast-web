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
  if (swap.tx.gasPrice == null) {
    return {
      status: 'working',
      details: 'fetching gas details'
    }
  }
  if (swap.tx.signed == null) {
    return {
      status: 'working',
      details: 'waiting for transaction to be signed'
    }
  }
  if (swap.txHash == null) {
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
  if ((swap.order.status == null || swap.order.status === 'no_deposits') && (swap.tx.confirmations == null || swap.tx.confirmations < 3)) {
    return {
      status: 'working',
      details: 'waiting for confirmations'
    }
  }
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
  if (!swapList || !swapList.length) return 'unavailable'
  const someSigned = swapList.some((send) => {
    return send.list.some((receive) => {
      return receive.tx.signed
    })
  })
  if (!someSigned) return 'unsigned'
  const allSent = swapList.every((send) => {
    return send.list.every((receive) => {
      return !!receive.txHash
    })
  })
  if (!allSent) return 'unsent'
  const allReceipts = swapList.every((send) => {
    return send.list.every((receive) => {
      return !!receive.tx.receipt
    })
  })
  if (!allReceipts) return 'pending_receipts'
  const finalized = swapList.every((send) => {
    return send.list.every((receive) => {
      return receive.order && (receive.order.status === 'complete' || receive.order.status === 'failed')
    })
  })
  if (finalized) {
    return 'finalized'
  } else {
    return 'pending_orders'
  }
}
