import pad from 'pad-left'

import config from 'Config'
import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toBigNumber, toSmallestDenomination, toMainDenomination, toHex } from 'Utilities/convert'
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
  return { data: config.tokenFunctionSignatures.transfer + dataAddress + dataAmount }
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

@abstractMethod('getAddress', 'transfer')
export default class EthereumWallet extends Wallet {

  constructor(type) {
    super(type)
    assertExtended(this, EthereumWallet)
  }

  isAssetSupported = (assetOrSymbol) => {
    const asset = this.getAsset(assetOrSymbol)
    return asset && (asset.symbol === 'ETH' || asset.ERC20)
  };

  _sendBalanceRequest = (assetOrSymbol, fromAddress, batch = null) => {
    const asset = this.getAsset(assetOrSymbol)
    let request
    if (!this.isAssetSupported(asset)) {
      request = Promise.resolve(toBigNumber(0))
    } else if (asset.symbol === 'ETH') {
      request = batchRequest(batch, web3.eth.getBalance, fromAddress, 'latest')
    } else {
      // Handle ERC20
      request = batchRequest(batch, web3.eth.call, {
        to: asset.contractAddress,
        data: tokenBalanceData(fromAddress)
      }, 'latest')
    }
    return request.then((balance) => toMainDenomination(balance, asset.decimals))
  };

  getBalance = (assetOrSymbol) => {
    const asset = this.getAsset(assetOrSymbol)
    return this.getAddress().then((address) => this._sendBalanceRequest(asset, address))
  }

  getAllBalances = () => {
    return this.getAddress()
      .then((address) => {
        const batch = new web3.BatchRequest()
        const balanceRequests = Object.values(this.getAllAssets())
          .map((asset) => this._sendBalanceRequest(asset, address, batch)
            .then((balance) => ({ asset, balance })))
        batch.execute()
        return Promise.all(balanceRequests)
      }).then((balances) => balances.reduce((result, { asset, balance }) => ({
        ...result,
        [asset.symbol]: balance
      }), {}))
  };

  _createTransferTx = (toAddress, amount, asset) => {
    let tx = {
      chainId: 1,
      value: toBigNumber(0),
      data: ''
    }
    if (asset.symbol === 'ETH') {
      tx.to = toAddress
      tx.value = toSmallestDenomination(amount, asset.decimals)
    } else {
      // Handle ERC20
      tx.to = asset.contractAddress,
      tx.data = tokenSendData(toAddress, amount, asset.decimals)
    }
    return Promise.all([
      this.getAddress(),
      web3.eth.getTransactionCount(tx.from),
      web3.eth.getGasPrice(),
      web3.eth.estimateGas(tx)
    ]).then(([fromAddress, nonce, gasPrice, gasLimit]) => ({
      ...tx,
      from: fromAddress,
      nonce: toHex(nonce),
      gasPrice: toHex(gasPrice),
      gasLimit: toHex(gasLimit)
    })).catch(log.error)
  };

}