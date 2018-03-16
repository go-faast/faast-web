
import web3 from 'Services/Web3'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import { addHexPrefix } from 'Utilities/helpers'

import EthereumWallet from './EthereumWallet'

@abstractMethod('getAddress', 'signTx')
export default class EthereumWalletSigner extends EthereumWallet {

  constructor() {
    super()
    assertExtended(this, EthereumWalletSigner)
  }

  sendTransaction = ({ txData: tx }, options = {}) => {
    const { onTxHash, onReceipt, onConfirmation, onError } = options
    return Promise.resolve(tx)
      .then(this._assignNonce)
      .then((tx) => this.signTx(tx, options))
      .then(addHexPrefix)
      .then((signedTx) => new Promise((resolve, reject) => {
        // sendSignedTransaction resolves when the tx receipt is available.
        // we don't want to wait for that so wrap it in a promise that
        // resolves after the tx is sent
        let resolved = false
        web3.eth.sendSignedTransaction(signedTx)
          .once('transactionHash', (txId) => {
            onTxHash(txId)
            resolve(txId)
            resolved = true
          })
          .once('receipt', onReceipt)
          .on('confirmation', onConfirmation)
          .on('error', (e) => {
            onError(e)
            if (!resolved) {
              // Avoid rejecting after resolve was called
              reject(e)
            }
          })
      }))
  };

  _isValidTx = (txParams) => {
    const required = ['chainId', 'data', 'from', 'gasLimit', 'gasPrice', 'nonce', 'to', 'value']
    if (typeof txParams !== 'object') return false
    return required.every((a) => {
      return txParams.hasOwnProperty(a)
    })
  };

  _validateTx = (txParams) => {
    if (!this._isValidTx(txParams)) {
      throw new Error('invalid tx', txParams)
    }
  };
}
