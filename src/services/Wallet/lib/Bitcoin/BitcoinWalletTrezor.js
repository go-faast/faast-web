import log from 'Utilities/log'
import { toSmallestDenomination } from 'Utilities/convert'
import { xpubToYpub } from 'Utilities/bitcoin'
import Trezor from 'Services/Trezor'

import BitcoinWallet from './BitcoinWallet'

export default class BitcoinWalletTrezor extends BitcoinWallet {

  constructor(xpub, derivationPath) {
    super('BitcoinWalletTrezor', xpub)
    this.derivationPath = derivationPath
  }

  static fromPath = (derivationPath = null) => {
    Trezor.setCurrency('BTC')
    return Trezor.getXPubKey(derivationPath)
      .then((result) => {
        log.info('Trezor xPubKey success')
        let { xpubkey, serializedPath } = result
        if (!serializedPath.startsWith('m/') && /^\d/.test(serializedPath)) {
          serializedPath = `m/${serializedPath}`
        }
        if (serializedPath.startsWith('m/49\'')) {
          xpubkey = xpubToYpub(xpubkey)
          log.info('Converted segwit xpub to ypub')
        }
        return new BitcoinWalletTrezor(xpubkey, serializedPath)
      })
  };

  createTransaction = (toAddress, amount, assetOrSymbol) =>
    Promise.resolve(assetOrSymbol)
      .then(this.assertAssetSupported)
      .then(this.getAsset)
      .then((asset) => ({
        toAddress,
        amount,
        asset,
        signed: false,
        feeAmount: null,
        feeAsset: 'BTC',
        txData: [{
          address: toAddress,
          amount: toSmallestDenomination(amount, asset.decimals).toNumber(),
        }]
      }));

  sendTransaction = ({ txData, ...rest }) => {
    log.info('sendTransaction', txData, rest)
    return Trezor.composeAndSignTx(txData)
      .then((result) => {
        log.info('Transaction composed and signed:', result)
        return result.serialized_tx
      })
      .then(Trezor.pushTransaction)
      .then((result) => {
        log.info('Transaction pushed:', result)
        return result.txid
      })
  };
}