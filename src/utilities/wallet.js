import web3 from 'Services/Web3'
import Trezor from 'Services/Trezor'
import walletService, { MultiWallet } from 'Services/Wallet'

export const closeTrezorWindow = () => Trezor && Trezor.close && Trezor.close()

export const isValidAddress = (address) => {
  return web3.utils.isAddress(address)
}

export const getWalletForAsset = (walletId, assetSymbol) => {
  const walletInstance = walletService.get(walletId)
  if (walletInstance instanceof MultiWallet) {
    return walletInstance.getWalletForAsset(assetSymbol)
  }
  return walletInstance
}