
import EthereumWalletWeb3 from './EthereumWalletWeb3'

export default class EthereumWalletViewOnly extends EthereumWalletWeb3 {

  static type = 'EthereumWalletViewOnly';

  constructor(address: string, label?: string) {
    super(address, undefined, label)
  }

  getType() { return EthereumWalletViewOnly.type }

  getTypeLabel() { return 'View only' }

  isReadOnly() { return true }

}
