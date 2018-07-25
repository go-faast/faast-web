import pad from 'pad-left'

import config from 'Config'
import web3 from 'Services/Web3'
import { toBigNumber, TEN } from 'Utilities/convert'

export const tokenSendData = (address, amount, decimals) => {
  amount = toBigNumber(amount)

  if (!web3.utils.isAddress(address)) return { error: 'invalid address' }
  if (amount.lessThan(0)) return { error: 'invalid amount' }
  if (typeof decimals !== 'number') return { error: 'invalid decimals' }

  const dataAddress = pad(address.toLowerCase().replace('0x', ''), 64, '0')
  const power = TEN.toPower(decimals)
  const dataAmount = pad(amount.times(power).toString(16), 64, '0')
  return config.tokenFunctionSignatures.transfer + dataAddress + dataAmount
};

export const tokenBalanceData = (walletAddress) => {
  if (walletAddress.startsWith('0x')) walletAddress = walletAddress.slice(2)
  return config.tokenFunctionSignatures.balanceOf + pad(walletAddress, 64, '0')
};

export const batchRequest = (batch, batchableFn, ...fnArgs) => {
  if (batch) {
    return new Promise((resolve, reject) => {
      batch.add(
        batchableFn.request(...fnArgs, (err, result) => {
          if (err) return reject(err)

          resolve(result)
        })
      )
    })
  }
  return batchableFn(...fnArgs)
}

/** Convert a web3 tx receipt to a universal receipt format */
export const toUniversalReceipt = (receipt) => !receipt ? null : ({
  confirmed: receipt.blockNumber && receipt.blockNumber > 0,
  succeeded: receipt.status === true || receipt.status === '0x1',
  blockNumber: receipt.blockNumber,
  raw: receipt
})

/** Send the transaction and return a promise that resolves to the txHash after the
  * transaction is broadcast to the network.
  */
export const web3SendTx = (txData, signed, options) => new Promise((resolve, reject) => {
  const { onTxHash, onReceipt, onConfirmation, onError } = options
  // sendSignedTransaction resolves when the tx receipt is available, which occurs after
  // confirmation, but we need to resolve right after sending so wrapping in a new
  // promise is necessary
  let resolved = false
  const sendFnName = signed ? 'sendSignedTransaction' : 'sendTransaction'
  const sendStatus = web3.eth[sendFnName](txData)
    .once('transactionHash', (txHash) => {
      resolve(txHash)
      resolved = true
    })
    .once('error', (e) => {
      if (!resolved) {
        // Avoid rejecting after resolve was called
        reject(e)
      }
    })
  if (typeof onTxHash === 'function') sendStatus.once('transactionHash', onTxHash)
  if (typeof onReceipt === 'function') sendStatus.once('receipt', (r) => onReceipt(toUniversalReceipt(r)))
  if (typeof onConfirmation === 'function') sendStatus.on('confirmation', onConfirmation)
  if (typeof onError === 'function') sendStatus.on('error', onError)
});
