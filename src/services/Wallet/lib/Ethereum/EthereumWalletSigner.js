
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
      .then((signedTx) => web3.eth.sendSignedTransaction(signedTx)
        .once('transactionHash', onTxHash)
        .once('receipt', onReceipt)
        .on('confirmation', onConfirmation)
        .on('error', onError))
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
