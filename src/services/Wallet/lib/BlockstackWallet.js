import EthereumjsWallet from 'ethereumjs-wallet'
import { loadUserData } from 'blockstack'
import { stripHexPrefix } from 'Utilities/helpers'
import EthereumWalletKeystore from './Ethereum/EthereumWalletKeystore'

const privateKeyToKeystore = (privateKeyString) => EthereumjsWallet.fromPrivateKey(Buffer.from(stripHexPrefix(privateKeyString.trim()), 'hex'))

export default class BlockstackWallet extends EthereumWalletKeystore {

  static type = 'BlockstackWallet';

  constructor(appPrivateKey) {
    super(privateKeyToKeystore(appPrivateKey))
    this.setPersistAllowed(false)
  }

  static create = () => new BlockstackWallet(loadUserData().appPrivateKey);

  getType = () => BlockstackWallet.type;

  getTypeLabel = () => 'Blockstack';
}