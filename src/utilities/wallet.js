import walletService, { MultiWallet } from 'Services/Wallet'

export const getWalletForAsset = (walletId, assetSymbol) => {
  const walletInstance = walletService.get(walletId)
  if (!walletInstance.isAssetSupported(assetSymbol)) {
    return
  }
  if (walletInstance instanceof MultiWallet) {
    return walletInstance.getWalletForAsset(assetSymbol)
  }
  return walletInstance
}
