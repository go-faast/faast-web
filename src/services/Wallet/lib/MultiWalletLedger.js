import config from 'Config'
import MultiWallet from './MultiWallet'

const typeLabel = config.walletTypes.trezor.name

export default class MultiWalletLedger extends MultiWallet {

  static type = 'MultiWalletLedger'

  getType() { return MultiWalletLedger.type }

  getTypeLabel() { return typeLabel }
  
  getLabel() { return this.label || `${typeLabel} ${this.getId().slice(0, 8)}` }

}
