import Trezor from 'Services/Trezor'
import walletService, { MultiWallet } from 'Services/Wallet'

export const closeTrezorWindow = () => Trezor && Trezor.close && Trezor.close()

export const getWalletForAsset = (walletId, assetSymbol) => {
  const walletInstance = walletService.get(walletId)
  if (walletInstance instanceof MultiWallet) {
    return walletInstance.getWalletForAsset(assetSymbol)
  }
  return walletInstance
}
