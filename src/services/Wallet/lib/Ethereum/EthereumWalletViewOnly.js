
import EthereumWalletWeb3 from './EthereumWalletWeb3'

export default class EthereumWalletViewOnly extends EthereumWalletWeb3 {

  static type = 'EthereumWalletViewOnly';

  constructor(address) {
    super(address)
    this.setReadOnly(true)
  }

  getType() { return EthereumWalletViewOnly.type }

  getTypeLabel() { return 'View only' }

}
