import config from 'Config'
import MultiWallet from './MultiWallet'

const typeLabel = config.walletTypes.trezor.name

export default class MultiWalletTrezor extends MultiWallet {

  static type = 'MultiWalletTrezor'

  getType() { return MultiWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  getLabel() { return this.label || typeLabel }

}
