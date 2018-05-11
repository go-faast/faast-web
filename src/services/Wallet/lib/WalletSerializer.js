import log from 'Utilities/log'
import Wallet from './Wallet'
import MultiWallet from './MultiWallet'
import MultiWalletTrezor from './MultiWalletTrezor'
import MultiWalletLedger from './MultiWalletLedger'
import {
  EthereumWalletWeb3, EthereumWalletTrezor, EthereumWalletLedger,
  EthereumWalletKeystore, EthereumWalletViewOnly, EthereumWalletBlockstack
} from './Ethereum'
import { BitcoinWalletTrezor } from './Bitcoin'

export const parse = (wallet) => {
  if (typeof wallet === 'string') {
    wallet = JSON.parse(wallet, (key, val) => {
      if (!(typeof val === 'object' && val.type)) {
        return val
      }
      const wallet = val
      let walletType = wallet.type
      if (wallet.data && wallet.data.type) {
        walletType = wallet.data.type
      }
      switch(walletType) {
        // Legacy formats
        case 'keystore': return new EthereumWalletKeystore(wallet.data)
        case 'metamask': return new EthereumWalletWeb3(wallet.address, 'MetaMask')
        case 'trezor': return new EthereumWalletTrezor(wallet.address, wallet.data.derivationPath)
        case 'ledger': return new EthereumWalletLedger(wallet.address, wallet.data.derivationPath)
        // New formats
        case 'MultiWallet': return new MultiWallet(wallet.id, wallet.wallets)
        case 'MultiWalletTrezor': return new MultiWalletTrezor(wallet.id, wallet.wallets)
        case 'MultiWalletLedger': return new MultiWalletLedger(wallet.id, wallet.wallets)
        case 'EthereumWalletKeystore': return new EthereumWalletKeystore(wallet.keystore)
        case 'EthereumWalletBlockstack': return new EthereumWalletBlockstack(wallet.keystore)
        case 'EthereumWalletWeb3': return new EthereumWalletWeb3(wallet.address, wallet.providerName)
        case 'EthereumWalletViewOnly': return new EthereumWalletViewOnly(wallet.address)
        case 'EthereumWalletTrezor': return new EthereumWalletTrezor(wallet.address, wallet.derivationPath)
        case 'EthereumWalletLedger': return new EthereumWalletLedger(wallet.address, wallet.derivationPath)
        case 'BitcoinWalletTrezor': return new BitcoinWalletTrezor(wallet.xpub, wallet.derivationPath)
        default: log.error(`Cannot parse wallet: invalid type '${walletType}'`, wallet)
      }
    })
  }
  if (!(wallet instanceof Wallet)) {
    return null
  }
  return wallet
}

export const stringify = (wallet) => {
  if (!wallet) {
    return null
  }
  if (!(wallet instanceof Wallet)) {
    throw new Error('Cannot stringify wallet: invalid instance')
  }
  return JSON.stringify(wallet, (key, val) => {
    if (!key.startsWith('_')) {
      return val
    }
  })
}

export default {
  parse,
  stringify
}
