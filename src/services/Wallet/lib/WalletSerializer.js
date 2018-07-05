import log from 'Utilities/log'
import Wallet from './Wallet'
import MultiWallet from './MultiWallet'
import MultiWalletTrezor from './MultiWalletTrezor'
import MultiWalletLedger from './MultiWalletLedger'
import {
  EthereumWalletWeb3, EthereumWalletTrezor, EthereumWalletLedger,
  EthereumWalletKeystore, EthereumWalletViewOnly, EthereumWalletBlockstack
} from './Ethereum'
import { BitcoinWalletTrezor, BitcoinWalletLedger } from './Bitcoin'

const parseWalletObject = (wallet) => {
  if (!wallet || typeof wallet !== 'object') {
    return null
  }
  if (wallet instanceof Wallet) {
    return wallet
  }
  let walletType = wallet.type
  if (wallet.data && wallet.data.type) {
    walletType = wallet.data.type
  }
  const { label } = wallet
  switch(walletType) {
    // Legacy formats
    case 'keystore': return new EthereumWalletKeystore(wallet.data, label)
    case 'metamask': return new EthereumWalletWeb3(wallet.address, 'MetaMask', label)
    case 'trezor': return new EthereumWalletTrezor(wallet.address, wallet.data.derivationPath, label)
    case 'ledger': return new EthereumWalletLedger(wallet.address, wallet.data.derivationPath, label)
    // New formats
    case 'MultiWallet': return new MultiWallet(wallet.id, wallet.walletIds || wallet.wallets, label)
    case 'MultiWalletTrezor': return new MultiWalletTrezor(wallet.id, wallet.walletIds || wallet.wallets, label)
    case 'MultiWalletLedger': return new MultiWalletLedger(wallet.id, wallet.walletIds || wallet.wallets, label)
    case 'EthereumWalletKeystore': return new EthereumWalletKeystore(wallet.keystore, label)
    case 'EthereumWalletBlockstack': return new EthereumWalletBlockstack(wallet.keystore, label)
    case 'EthereumWalletWeb3': return new EthereumWalletWeb3(wallet.address, wallet.providerName, label)
    case 'EthereumWalletViewOnly': return new EthereumWalletViewOnly(wallet.address, label)
    case 'EthereumWalletTrezor': return new EthereumWalletTrezor(wallet.address, wallet.derivationPath, label)
    case 'EthereumWalletLedger': return new EthereumWalletLedger(wallet.address, wallet.derivationPath, label)
    case 'BitcoinWalletTrezor': return new BitcoinWalletTrezor(wallet.xpub, wallet.derivationPath, label)
    case 'BitcoinWalletLedger': return new BitcoinWalletLedger(wallet.xpub, wallet.derivationPath, label)
    default: log.error(`Cannot parse wallet: invalid type '${walletType}'`, wallet)
  }
}

export const parse = (wallet) => {
  if (!wallet) {
    return null
  }
  if (typeof wallet === 'object') {
    return parseWalletObject(wallet)
  }
  if (typeof wallet === 'string') {
    wallet = JSON.parse(wallet, (key, val) => {
      if (val !== null && typeof val === 'object' && typeof val.type === 'string') {
        return parseWalletObject(val)
      }
      return val
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
      if (val instanceof Set) {
        return Array.from(val)
      }
      return val
    }
  })
}

export default {
  parse,
  stringify
}
