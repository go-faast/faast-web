import pad from 'pad-left'

import config from 'Config'
import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toBigNumber, toSmallestDenomination, toMainDenomination, toHex, toTxFee } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'

import Wallet from '../Wallet'

const tokenSendData = (address, amount, decimals) => {
  amount = toBigNumber(amount)

  if (!web3.utils.isAddress(address)) return { error: 'invalid address' }
  if (amount.lessThan(0)) return { error: 'invalid amount' }
  if (typeof decimals !== 'number') return { error: 'invalid decimals' }

  const dataAddress = pad(address.toLowerCase().replace('0x', ''), 64, '0')
  const power = toBigNumber(10).toPower(decimals)
  const dataAmount = pad(amount.times(power).toString(16), 64, '0')
  return config.tokenFunctionSignatures.transfer + dataAddress + dataAmount
};

const tokenBalanceData = (walletAddress) => {
  if (walletAddress.startsWith('0x')) walletAddress = walletAddress.slice(2)
  return config.tokenFunctionSignatures.balanceOf + pad(walletAddress, 64, '0')
};

const batchRequest = (batch, batchableFn, ...fnArgs) => {
  if (batch) {
    return new Promise((resolve, reject) => {
      batch.add(
        batchableFn.request(...fnArgs, (err, result) => {
          if (err) return reject(err)

          resolve(result)
        })
      )
    })
  }
  return batchableFn(...fnArgs)
}

@abstractMethod('getAddress', 'sendTransaction')
export default class EthereumWallet extends Wallet {

  constructor(type) {
    super(type)
    assertExtended(this, EthereumWallet)
  }

  getId = () => this.getAddress();

  isAssetSupported = (assetOrSymbol) => {
    const asset = this.getAsset(assetOrSymbol)
    return asset && (asset.symbol === 'ETH' || asset.ERC20)
  };

  _sendBalanceRequest = (assetOrSymbol, batch = null) => {
    const asset = this.getAsset(assetOrSymbol)
    const address = this.getAddress()
    let request
    if (!this.isAssetSupported(asset)) {
      request = Promise.resolve(toBigNumber(0))
    } else if (asset.symbol === 'ETH') {
      request = batchRequest(batch, web3.eth.getBalance, address, 'latest')
    } else {
      // Handle ERC20
      request = batchRequest(batch, web3.eth.call, {
        to: asset.contractAddress,
        data: tokenBalanceData(address)
      }, 'latest')
    }
    return request.then((balance) => toMainDenomination(balance, asset.decimals))
  };

  getBalance = (assetOrSymbol) => this._sendBalanceRequest(assetOrSymbol);

  getAllBalances = () => {
    return Promise.resolve()
      .then(() => {
        const batch = new web3.BatchRequest()
        const assetBalances = Object.values(this.getAllAssets()).map((asset) =>
          this._sendBalanceRequest(asset, batch)
            .then((balance) => ({ ...asset, balance })))
        batch.execute()
        return Promise.all(assetBalances)
      }).then((assets) => assets.reduce((result, { symbol, balance }) => ({
        ...result,
        [symbol]: balance
      }), {}))
  };

  _assignNonce = (txData) => {
    return web3.eth.getTransactionCount(txData.from)
      .then((nonce) => ({
        nonce: toHex(nonce),
        ...txData
      }))
  };

  createTransaction = (toAddress, amount, assetOrSymbol) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.getAsset)
      .then((asset) => {
        let tx = {
          chainId: 1,
          from: this.getAddress(),
          value: toBigNumber(0),
          data: ''
        }
        if (asset.symbol === 'ETH') {
          tx.to = toAddress
          tx.value = toSmallestDenomination(amount, asset.decimals)
        } else if (asset.ERC20) {
          // Handle ERC20
          tx.to = asset.contractAddress,
          tx.data = tokenSendData(toAddress, amount, asset.decimals)
        } else {
          throw new Error(`Unsupported asset ${asset.symbol || asset} provided to EthereumWallet`)
        }
        tx.value = toHex(tx.value)
        console.log(tx)
        return Promise.all([
          web3.eth.getGasPrice(),
          web3.eth.estimateGas(tx)
        ]).then(([gasPrice, gasLimit]) => ({
          toAddress,
          amount,
          asset,
          feeAmount: toTxFee(gasLimit, gasPrice),
          feeAsset: 'ETH',
          txData: {
            ...tx,
            gasPrice: toHex(gasPrice),
            gasLimit: toHex(gasLimit)
          }
        }))
        .then((tx) => ({
          ...tx,
          ...tx.txData // TODO: Added for back compat. Remove after refactoring
        }))
      })
  };

}