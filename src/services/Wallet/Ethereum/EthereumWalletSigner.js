
import web3 from 'Services/Web3'
import { assertMethods, assertExtended } from 'Utilities/reflect'
import { addHexPrefix } from 'Utilities/helpers'

import EthereumWallet from './EthereumWallet'

export default class EthereumWalletSigner extends EthereumWallet {

  constructor(type) {
    super(type)
    assertExtended(this, EthereumWalletSigner)
    assertMethods(this, EthereumWalletSigner, 'getAddress', 'signTx')
  }

  transfer = (toAddress, amount, assetOrSymbol) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.assertAssetSupported)
      .then((asset) => this._createTransferTx(toAddress, amount, asset)
        .then(this.signTx)
        .then(addHexPrefix)
        .then(web3.eth.sendSignedTransaction))
  };

  _isValidTx = (txParams) => {
    const required = ['chainId', 'data', 'from', 'gasLimit', 'gasPrice', 'nonce', 'to', 'value']
    if (typeof txParams !== 'object') return false
    return required.every((a) => {
      return txParams.hasOwnProperty(a)
    })
  };

  _validateTx = (txParams) => {
    if (!this.isValidTx(txParams)) {
      throw new Error('invalid tx', txParams)
    }
  };
}