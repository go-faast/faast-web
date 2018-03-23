import log from 'Utilities/log'
import { toSmallestDenomination } from 'Utilities/convert'
import { xpubToYpub } from 'Utilities/bitcoin'
import Trezor from 'Services/Trezor'

import BitcoinWallet from './BitcoinWallet'

export default class BitcoinWalletTrezor extends BitcoinWallet {

  static type = 'BitcoinWalletTrezor';

  constructor(xpub, derivationPath) {
    super(xpub)
    this.derivationPath = derivationPath
  }

  getType = () => BitcoinWalletTrezor.type;

  getTypeLabel = () => 'TREZOR';

  getIconUrl = () => 'https://faa.st/img/trezor-logo.png';

  isLegacyAccount = () => this.derivationPath.startsWith('m/44');

  getAccountNumber = () => Number.parseInt(this.derivationPath.match(/(\d+)'$/)[1]) + 1;

  getLabel = () => this.label || `Bitcoin${this.isLegacyAccount() ? 'legacy ' : ''} #${this.getAccountNumber()}`;

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

  createTransaction = (toAddress, amount, assetOrSymbol) => Promise.resolve(assetOrSymbol)
    .then(this.assertAssetSupported)
    .then(this.getAsset)
    .then((asset) => ({
      walletId: this.getId(),
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

  _signTxData = (txData) => Trezor.composeAndSignTx(txData)
    .then((result) => {
      log.info('Transaction composed and signed:', result)
      return result.serialized_tx
    });

  _sendSignedTxData = (signedTxData) => Trezor.pushTransaction(signedTxData)
    .then((result) => {
      log.info('Transaction pushed:', result)
      return result.txid
    });

  _validateTxData = (txData) => {
    if (txData === null || !Array.isArray(txData)) {
      throw new Error(`Invalid ${this.getType} txData of type ${typeof txData}`)
    }
    return txData
  };

  _validateSignedTxData = (signedTxData) => {
    if (typeof signedTxData !== 'string') {
      throw new Error(`Invalid ${this.getType} signedTxData of type ${typeof signedTxData}`)
    }
    return signedTxData
  }
}