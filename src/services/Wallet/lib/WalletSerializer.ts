import log from 'Utilities/log'
import Wallet from './Wallet'
import MultiWallet from './MultiWallet'
import MultiWalletTrezor from './MultiWalletTrezor'
import MultiWalletLedger from './MultiWalletLedger'
import {
  EthereumWalletWeb3, EthereumWalletTrezor, EthereumWalletLedger,
  EthereumWalletKeystore, EthereumWalletViewOnly,
} from './Ethereum'
import { BitcoinWalletTrezor, BitcoinWalletLedger } from './Bitcoin'
import { BitcoinCashWalletTrezor, BitcoinCashWalletLedger } from './BitcoinCash'
import { LitecoinWalletTrezor, LitecoinWalletLedger } from './Litecoin'

interface SerializedWallet {
  id: string,
  label: string,
  type: string,
  address?: string,
  derivationPath?: string,
  walletIds?: string[],
  providerName?: string,
  xpub?: string,
  keystore?: object,
}

const parseWalletObject = (wallet: Wallet | SerializedWallet): Wallet | null => {
  if (!wallet || typeof wallet !== 'object') {
    return null
  }
  if (wallet instanceof Wallet) {
    return wallet
  }
  const { type, label } = wallet
  switch (type) {
    // New formats
    case 'MultiWallet': return new MultiWallet(wallet.id, wallet.walletIds, label)
    case 'MultiWalletTrezor': return new MultiWalletTrezor(wallet.id, wallet.walletIds, label)
    case 'MultiWalletLedger': return new MultiWalletLedger(wallet.id, wallet.walletIds, label)
    case 'EthereumWalletKeystore': return new EthereumWalletKeystore(wallet.keystore, label)
    case 'EthereumWalletWeb3': return new EthereumWalletWeb3(wallet.address, wallet.providerName, label)
    case 'EthereumWalletViewOnly': return new EthereumWalletViewOnly(wallet.address, label)
    case 'EthereumWalletTrezor': return new EthereumWalletTrezor(wallet.address, wallet.derivationPath, label)
    case 'EthereumWalletLedger': return new EthereumWalletLedger(wallet.address, wallet.derivationPath, label)
    case 'BitcoinWalletTrezor': return new BitcoinWalletTrezor(wallet.xpub, wallet.derivationPath, label)
    case 'BitcoinWalletLedger': return new BitcoinWalletLedger(wallet.xpub, wallet.derivationPath, label)
    case 'BitcoinCashWalletTrezor': return new BitcoinCashWalletTrezor(wallet.xpub, wallet.derivationPath, label)
    case 'BitcoinCashWalletLedger': return new BitcoinCashWalletLedger(wallet.xpub, wallet.derivationPath, label)
    case 'LitecoinWalletTrezor': return new LitecoinWalletTrezor(wallet.xpub, wallet.derivationPath, label)
    case 'LitecoinWalletLedger': return new LitecoinWalletLedger(wallet.xpub, wallet.derivationPath, label)
    default: log.error(`Cannot parse wallet: invalid type '${type}'`, wallet)
  }
  return null
}

export const parse = (wallet: Wallet | SerializedWallet | string | null): Wallet | null => {
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
  if (wallet instanceof Wallet) {
    return wallet
  }
  return null
}

export const stringify = (wallet: Wallet | null): string => {
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
  stringify,
}
