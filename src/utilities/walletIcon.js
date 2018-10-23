import { isFunction } from 'lodash'
import {
  BitcoreWallet,
  EthereumWallet,
  EthereumWalletKeystore,
} from 'Services/Wallet'
import config from 'Config'
const { walletTypes } = config

import UnknownIcon from 'Img/question-mark-white.svg?inline'
import PortfolioIcon from 'Img/wallet/portfolio.svg?inline'
import ViewOnlyIcon from 'Img/wallet/view-only.svg?inline'

const coinIcon = (symbol) => `${config.apiUrl}/api/v1/public/static/img/coins/icon_${symbol}.png`

const EthereumIcon = coinIcon('ETH')

const typeToIconProps = {
  [EthereumWalletKeystore.type]: { src: EthereumIcon },
}

export const getWalletIconProps = (walletInstance) => {
  const matchedTypeProps = typeToIconProps[walletInstance.getType()]
  if (matchedTypeProps) {
    return isFunction(matchedTypeProps) ? matchedTypeProps(walletInstance) : matchedTypeProps
  }
  const type = walletInstance.getType().toLowerCase()
  if (type.includes('trezor')) {
    return { src: walletTypes.trezor.icon }
  }
  if (type.includes('ledger')) {
    return { src: walletTypes.ledger.icon }
  }
  if (type.includes('blockstack')) {
    return { src: walletTypes.blockstack.icon }
  }
  if (type.includes('web3')) {
    return { src: (walletTypes[walletInstance.providerName] || {}).icon || EthereumIcon }
  }
  if (type.includes('viewonly')) {
    return { src: ViewOnlyIcon, color: 'primary' }
  }
  if (type.includes('multiwallet')) {
    return { src: PortfolioIcon, color: 'primary' }
  }
  // Fallbacks
  if (walletInstance instanceof EthereumWallet || type.includes('ethereum')) {
    return { src: EthereumIcon }
  }
  if (walletInstance instanceof BitcoreWallet || walletInstance.assetSymbol) {
    return { src: coinIcon(walletInstance.assetSymbol) }
  }
  return { src: UnknownIcon }
}
