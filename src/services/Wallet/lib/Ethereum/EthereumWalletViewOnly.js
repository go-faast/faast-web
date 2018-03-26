
import { EthereumWalletWeb3 } from './Ethereum'

export default class EthereumWalletViewOnly extends EthereumWalletWeb3 {

  static type = 'EthereumWalletViewOnly';

  constructor(address) {
    super(address)
    this.setPersistAllowed(false)
    this.setReadOnly(true)
  }

  getType = () => EthereumWalletViewOnly.type;

  getTypeLabel = () => 'View only';

}