import pad from 'pad-left'

import config from 'Config'
import { Web3 } from 'Services/Web3'
import { BatchRequest, Tx as Web3Tx } from 'web3/eth/types'
import { toBigNumber, TEN } from 'Utilities/convert'
import { isValidAddress } from 'Utilities/wallet'
import { Web3Receipt, Receipt, Amount } from '../types'
import { BatchableFn, SendOptions } from './types'

export function tokenSendData(address: string, amount: Amount, decimals: number) {
  amount = toBigNumber(amount)

  if (!isValidAddress(address)) { throw new Error('invalid address') }
  if (amount.lessThan(0)) { throw new Error('invalid amount') }
  if (typeof decimals !== 'number') { throw new Error('invalid decimals') }

  const dataAddress = pad(address.toLowerCase().replace('0x', ''), 64, '0')
  const power = TEN.toPower(decimals)
  const dataAmount = pad(amount.times(power).toString(16), 64, '0')
  return config.tokenFunctionSignatures.transfer + dataAddress + dataAmount
};

export function tokenBalanceData(walletAddress: string): string {
  if (walletAddress.startsWith('0x')) {
    walletAddress = walletAddress.slice(2)
  }
  return config.tokenFunctionSignatures.balanceOf + pad(walletAddress, 64, '0')
};

export function batchRequest<T>(batch: BatchRequest | null, batchableFn: BatchableFn<T>, ...fnArgs: any[]): Promise<T> {
  if (batch) {
    return new Promise((resolve, reject) => {
      batch.add(batchableFn.request(...fnArgs, (err: Error, result: T) => {
        if (err) { return reject(err) }

        resolve(result)
      }))
    })
  }
  return batchableFn(...fnArgs)
}

/** Convert a web3 tx receipt to a universal receipt format */
export function toUniversalReceipt(receipt: Web3Receipt): Receipt {
  return !receipt ? null : {
    confirmed: receipt.blockNumber && receipt.blockNumber > 0,
    succeeded: receipt.status === true || receipt.status === 1 || receipt.status === '0x1',
    blockNumber: receipt.blockNumber,
    raw: receipt,
  }
}

/** Send the transaction and return a promise that resolves to the txHash after the
 * transaction is broadcast to the network.
 */
export function web3SendTx(userWeb3: Web3, txData: Web3Tx | string, options: SendOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const { onTxHash, onReceipt, onConfirmation, onError } = options
    // sendSignedTransaction resolves when the tx receipt is available, which occurs after
    // confirmation, but we need to resolve right after sending so wrapping in a new
    // promise is necessary
    let resolved = false

    const sendStatus = typeof txData === 'string'
      ? userWeb3.eth.sendSignedTransaction(txData)
      : userWeb3.eth.sendTransaction(txData)

    sendStatus
      .once('transactionHash', (txHash: string) => {
        resolve(txHash)
        resolved = true
      })
      .once('error', (e: Error) => {
        if (!resolved) {
          // Avoid rejecting after resolve was called
          reject(e)
        }
      })
    if (typeof onTxHash === 'function') {
      sendStatus.once('transactionHash', onTxHash)
      }
    if (typeof onReceipt === 'function') {
      sendStatus.once('receipt', (r: Web3Receipt) => onReceipt(toUniversalReceipt(r)))
    }
    if (typeof onConfirmation === 'function') {
      sendStatus.on('confirmation', onConfirmation)
    }
    if (typeof onError === 'function') {
      sendStatus.on('error', onError)
    }
    return sendStatus
  })
}
