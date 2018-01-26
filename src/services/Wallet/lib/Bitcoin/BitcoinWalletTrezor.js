import { toSmallestDenomination } from 'Utilities/convert'
import BitcoinWallet from './BitcoinWallet'

export default class BitcoinWalletTrezor extends BitcoinWallet {

  constructor(xpub, derivationPath) {
    super('BitcoinWalletTrezor', xpub)
    this.derivationPath = derivationPath
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
            return reject(result.error)
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
          return reject(result.error)
        }
      });
    })
  };
}