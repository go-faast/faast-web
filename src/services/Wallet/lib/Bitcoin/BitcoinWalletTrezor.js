import log from 'Utilities/log'
import { toSmallestDenomination } from 'Utilities/convert'
import { xpubToYpub } from 'Utilities/bitcoin'
import BitcoinWallet from './BitcoinWallet'

export default class BitcoinWalletTrezor extends BitcoinWallet {

  constructor(xpub, derivationPath) {
    super('BitcoinWalletTrezor', xpub)
    this.derivationPath = derivationPath
  }

  static fromPath = (derivationPath = 'm/49\'/0\'/0\'') => {
    return new Promise((resolve, reject) => {
      window.faast.hw.trezor.getXPubKey(derivationPath, (result) => {
        if (result.success) {
          log.info('Trezor xPubKey success', result)
          let xpub = result.xpubkey
          if (derivationPath.startsWith('m/49\'')) {
            xpub = xpubToYpub(xpub)
            log.info('Converted segwit xpub to ypub', xpub)
          }
          return resolve(new BitcoinWalletTrezor(xpub, derivationPath))
        } else {
          reject(new Error(result.error))
        }
      })
    })
  }

  createTransaction = (toAddress, amount, assetOrSymbol) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.getAsset)
      .then((asset) => new Promise((resolve, reject) => {
        window.faast.hw.trezor.composeAndSignTx({ address: toAddress, amount: toSmallestDenomination(amount, asset.decimals) }, (result) => {
          if (result.success) {
            console.log('Transaction composed and signed:', result)
            return resolve({
              toAddress,
              amount,
              asset,
              feeAmount: 0,
              feeAsset: 'BTC',
              txData: result.serialized_tx
            });
          } else {
            return reject(new Error(result.error))
          }
        })
      }))
  };

  sendTransaction = ({ txData }) => {
    return new Promise((resolve, reject) => {
      window.faast.hw.trezor.pushTransaction(txData, (result) => {
        if (result.success) {
          console.log('Transaction pushed:', result);
          return resolve(result.txid)
        } else {
          return reject(new Error(result.error))
        }
      });
    })
  };
}