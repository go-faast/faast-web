import pad from 'pad-left'

import config from 'Config'
import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toBigNumber, toSmallestDenomination, toHex } from 'Utilities/convert'
import { addHexPrefix } from 'Utilities/helpers'
import { assertMethods, assertExtended } from 'Utilities/reflect'

import Wallet from '../Wallet'

const tokenTxData = (address, amount, decimals) => {
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

const metamaskTx = (txParams) => ({
  from: txParams.from,
  to: txParams.to,
  value: toBigNumber(txParams.value),
  gas: toBigNumber(txParams.gasLimit).toNumber(),
  gasPrice: toBigNumber(txParams.gasPrice),
  data: txParams.data,
  nonce: toBigNumber(txParams.nonce).toNumber()
});

const isValidTx = (txParams) => {
  const required = ['chainId', 'data', 'from', 'gasLimit', 'gasPrice', 'nonce', 'to', 'value']
  if (typeof txParams !== 'object') return false
  return required.every((a) => {
    return txParams.hasOwnProperty(a)
  })
};

const validateTx = (txParams) => {
  if (!this.isValidTx(txParams)) {
    throw new Error('invalid tx', txParams)
  }
};

const finishTx = (tx) => Promise.all([
  web3.eth.getTransactionCount(tx.from),
  web3.eth.getGasPrice(),
  web3.eth.estimateGas(tx)
])
.then(([nonce, gasPrice, gasLimit]) => ({
  ...tx,
  nonce: toHex(nonce),
  gasPrice: toHex(gasPrice),
  gasLimit: toHex(gasLimit)
}))
.catch(log.error);


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

export default class EthereumWallet extends Wallet {

  constructor() {
    super()
    assertExtended(this, EthereumWallet)
    assertMethods(this, EthereumWallet, 'getAddress', 'signTx')
  }

  isSupportedAsset = (asset) => {
    if (typeof asset === 'string') {
      asset = this.getAsset(asset)
    }
    return asset.symbol === 'ETH' || asset.ERC20
  };

  send = (symbol, amount, to) => {
    let tx = {
      from: this.getAddress(),
      chainId: 1
    }
    const asset = this.getAsset(symbol)
    if (symbol === 'ETH') {
      tx = {
        ...tx,
        to,
        value: toSmallestDenomination(amount, asset.decimals),
        data: ''
      }
    } else {
      if (!asset.ERC20) {
        throw new Error(`Asset ${symbol} not supported by EthereumWallet`)
      }
      tx = {
        ...tx,
        to: asset.contractAddress,
        value: toBigNumber(0),
        data: tokenTxData(to, amount, asset.decimals)
      }
    }
    return finishTx(tx)
      .then(this.signTx)
      .then(addHexPrefix)
      .then(web3.eth.sendSignedTransaction)
  };

  getBalance = (symbol, batch) => {
    const asset = this.getAsset(symbol)
    if (symbol === 'ETH') {
      return batchRequest(batch, web3.eth.getBalance, this.getAddress(), 'latest')
    } else {
      if (!asset.ERC20) {
        throw new Error(`Asset ${symbol} not supported by EthereumWallet`)
      }
      return batchRequest(batch, web3.eth.call, {
        to: asset.contractAddress,
        data: tokenBalanceData(this.getAddress())
      }, 'latest')
    }
  };

}