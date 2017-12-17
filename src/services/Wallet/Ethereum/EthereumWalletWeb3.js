import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toChecksumAddress, toBigNumber } from 'Utilities/convert'

import EthereumWallet from './EthereumWallet'

export default class EthereumWalletWeb3 extends EthereumWallet {

  constructor() {
    super('EthereumWalletWeb3')
  }

  transfer = (toAddress, amount, assetOrSymbol) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.assertAssetSupported)
      .then((asset) => this._createTransferTx(toAddress, amount, asset)
        .then((tx) => ({
          ...tx,
          value: toBigNumber(tx.value),
          gas: toBigNumber(tx.gasLimit).toNumber(),
          gasPrice: toBigNumber(tx.gasPrice),
          nonce: toBigNumber(tx.nonce).toNumber()
        })
        .then(web3.eth.sendTransaction)))
  };

  getAddress = () => {
    return toChecksumAddress(web3.eth.defaultAccount || web3.eth.accounts[0])
  };

}