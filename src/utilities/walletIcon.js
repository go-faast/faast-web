import { isFunction } from 'lodash'
import {
  MultiWallet,
  BitcoinWallet,
  EthereumWallet,
  EthereumWalletKeystore,
  EthereumWalletWeb3,
} from 'Services/Wallet'

import PortfolioIcon from 'Img/wallet/portfolio.svg?inline'
import ViewOnlyIcon from 'Img/wallet/view-only.svg?inline'

import EthereumIcon from 'Img/coin/ETH.png'
import BitcoinIcon from 'Img/coin/BTC.png'

import TrezorLogo from 'Img/wallet/trezor-logo.png'
import LedgerLogo from 'Img/wallet/ledger-logo.png'
import MetaMaskLogo from 'Img/wallet/metamask-logo.png'
import ParityLogo from 'Img/wallet/parity-logo.svg'
import MistLogo from 'Img/wallet/mist-logo.png'
import BlockstackLogo from 'Img/wallet/blockstack-logo.png'

const web3ProviderToIconProps = {
  MetaMask: { src: MetaMaskLogo },
  ParityLogo: { src: ParityLogo },
  Mist: { src: MistLogo }
}

const typeToIconProps = {
  [MultiWallet]: { src: PortfolioIcon, color: 'primary' },
  [EthereumWalletKeystore]: { src: EthereumIcon },
  [EthereumWalletWeb3]: (walletInstance) => web3ProviderToIconProps[walletInstance.providerName] || {
    src: EthereumIcon
  }
}

export const getWalletIconProps = (walletInstance) => {
  const matchedTypeProps = typeToIconProps[walletInstance.constructor]
  if (matchedTypeProps) {
    return isFunction(matchedTypeProps) ? matchedTypeProps(walletInstance) : matchedTypeProps
  }
  const type = walletInstance.getType().toLowerCase()
  if (type.includes('trezor')) {
    return { src: TrezorLogo }
  }
  if (type.includes('ledger')) {
    return { src: LedgerLogo }
  }
  if (type.includes('blockstack')) {
    return { src: BlockstackLogo }
  }
  if (type.includes('viewonly')) {
    return { src: ViewOnlyIcon, color: 'primary' }
  }
  // Fallbacks
  if (walletInstance instanceof BitcoinWallet || type.includes('bitcoin')) {
    return { src: BitcoinIcon }
  }
  if (walletInstance instanceof EthereumWallet || type.includes('ethereum')) {
    return { src: EthereumIcon }
  }
  return null
}