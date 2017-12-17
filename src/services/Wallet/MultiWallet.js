import log from 'Utilities/log'
import { toBigNumber } from 'Utilities/convert'

import Wallet from './Wallet'

const selectFirst = (wallets) => Promise.resolve(wallets[0])

export class MultiWallet extends Wallet {

  constructor() {
    super('MultiWallet')
    this.wallets = []
  }

  _getWalletsForAsset = (assetOrSymbol) => {
    return this.wallets.filter((wallet) => wallet.isAssetSupported(assetOrSymbol))
  };

  isAssetSupported = (assetOrSymbol) => {
    return this.wallets.some((wallet) => wallet.isAssetSupported(assetOrSymbol))
  };

  transfer = (toAddress, amount, assetOrSymbol, selectWalletCallback = selectFirst) => {
    const walletsForAsset = this.getWalletsForAsset(assetOrSymbol)
    if (walletsForAsset.length === 0) {
      const symbol = assetOrSymbol.symbol || assetOrSymbol
      return Promise.reject(new Error(`Failed to find wallet supporting ${symbol}`))
    }
    if (walletsForAsset.length === 1) {
      selectWalletCallback = selectFirst
    }
    return selectWalletCallback(walletsForAsset).then((wallet) => wallet.transfer(toAddress, amount, assetOrSymbol))
  };

  getBalance = (assetOrSymbol) => {
    const balancePromises = this.getWalletsForAsset(assetOrSymbol)
      .map((wallet) => wallet.getBalance(assetOrSymbol))
    return Promise.all(balancePromises).then((balances) => 
      balances.reduce((a, b) => a.plus(b), toBigNumber(0)))
  };

  getAllBalances = () => {
    const result = {}
    this.wallets.map((wallet) => wallet.getAllBalances())
      .forEach((balances) => {
        Object.entries(balances).forEach(([symbol, balance]) => {
          result[symbol] = (result[symbol] || toBigNumber(0)).plus(balance)
        })
      })
    return result
  };
}