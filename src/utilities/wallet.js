import pad from 'pad-left'
import EthereumjsWallet from 'ethereumjs-wallet'
import EthereumjsTx from 'ethereumjs-tx'
import RLP from 'rlp'
import { toBigNumber } from 'Utilities/convert'
import { stripHexPrefix, addHexPrefix } from 'Utilities/helpers'
import log from 'Utilities/log'
import { restoreWalletFromStorage } from 'Utilities/storage'
import blockstack from 'Utilities/blockstack'
import toastr from 'Utilities/toastrWrapper'
import { mockHardwareWalletSign } from 'Actions/mock'
import config from 'Config'

export const generateWallet = () => {
  return EthereumjsWallet.generate()
}

export const generateWalletFromPrivateKey = (privateKey, password) => {
  const pk = Buffer.from(stripHexPrefix(privateKey.trim()), 'hex')
  try {
    const EW = EthereumjsWallet.fromPrivateKey(pk)
    return encryptWallet(EW, password)
  } catch (e) {
    return null
  }
}

export const getFileName = (wallet) => {
  return wallet.getV3Filename()
}

export const parseWalletString = (value) => {
  let wallet
  try {
    wallet = JSON.parse(value)
  } catch (err) {
    return null
  }
  if (!wallet || (wallet.type === 'keystore' && !wallet.data.hasOwnProperty('crypto') && !wallet.data.hasOwnProperty('Crypto'))) {
    return null
  }

  return wallet
}

export const parseEncryptedWalletString = (value) => {
  let encryptedWallet
  try {
    encryptedWallet = JSON.parse(value)
  } catch (err) {
    return null
  }
  if (!encryptedWallet || (!encryptedWallet.hasOwnProperty('crypto') && !encryptedWallet.hasOwnProperty('Crypto'))) {
    return null
  }

  return encryptedWallet
}

export const tokenBalanceData = (walletAddress) => {
  if (walletAddress.startsWith('0x')) walletAddress = walletAddress.slice(2)
  return config.tokenFunctionSignatures.balanceOf + pad(walletAddress, 64, '0')
}

export const tokenTxData = (address, amount, decimals) => {
  amount = toBigNumber(amount)

  if (!window.faast.web3.utils.isAddress(address)) return { error: 'invalid address' }
  if (amount.lessThan(0)) return { error: 'invalid amount' }
  if (typeof decimals !== 'number') return { error: 'invalid decimals' }

  const dataAddress = pad(address.toLowerCase().replace('0x', ''), 64, '0')
  const power = toBigNumber(10).toPower(decimals)
  const dataAmount = pad(amount.times(power).toString(16), 64, '0')
  return { data: config.tokenFunctionSignatures.transfer + dataAddress + dataAmount }
}

export const encryptWallet = (wallet, password = '') => {
  return wallet.toV3(password, config.encrOpts)
}

export const decryptWallet = (encryptedWallet, password = '') => {
  return new Promise((resolve, reject) => {
    if (typeof encryptedWallet !== 'object') return reject(new Error('wallet not an object'))
    if (!encryptedWallet.hasOwnProperty('crypto') && !encryptedWallet.hasOwnProperty('Crypto')) {
      return reject(new Error('no crypto information'))
    }
    if (encryptedWallet.hasOwnProperty('Crypto')) {
      encryptedWallet = Object.assign({}, encryptedWallet, {
        crypto: encryptedWallet.Crypto
      })
    }

    try {
      const EW = EthereumjsWallet.fromV3(encryptedWallet, password)
      resolve(EW)
    } catch (e) {
      reject(e)
    }
  })
}

export const getPrivateKeyString = (encryptedWallet, password, mock) => {
  return new Promise((resolve, reject) => {
    if (mock) return resolve('mock_pk_123')

    decryptWallet(encryptedWallet, password)
    .then((ew) => {
      resolve(ew.getPrivateKeyString())
    })
    .catch(reject)
  })
}

const validateTx = (txParams) => {
  const required = ['chainId', 'data', 'from', 'gasLimit', 'gasPrice', 'nonce', 'to', 'value']
  if (typeof txParams !== 'object') return false
  return required.every((a) => {
    return txParams.hasOwnProperty(a)
  })
}

export const txWeb3 = (txParams) => {
  return {
    from: txParams.from,
    to: txParams.to,
    value: toBigNumber(txParams.value),
    gas: toBigNumber(txParams.gasLimit).toNumber(),
    gasPrice: toBigNumber(txParams.gasPrice),
    data: txParams.data,
    nonce: toBigNumber(txParams.nonce).toNumber()
  }
}

export const signTxWithPrivateKey = (txParams, privateKey, mock) => {
  privateKey = stripHexPrefix(privateKey)
  return new Promise((resolve, reject) => {
    if (!validateTx(txParams)) return reject(new Error('invalid tx'))
    if (mock) return resolve('mock_signed_123')
    try {
      const tx = new EthereumjsTx(txParams)
      tx.sign(Buffer.from(privateKey, 'hex'))
      const signedTx = tx.serialize().toString('hex')
      resolve(signedTx)
    } catch (e) {
      reject(e)
    }
  })
}

export const signWithTrezor = (derivationPath, txParams) => {
  return new Promise((resolve, reject) => {
    window.faast.hw.trezor.closeAfterSuccess(false)
    window.faast.hw.trezor.signEthereumTx(
      derivationPath,
      stripHexPrefix(txParams.nonce),
      stripHexPrefix(txParams.gasPrice),
      stripHexPrefix(txParams.gasLimit),
      stripHexPrefix(txParams.to),
      stripHexPrefix(txParams.value),
      stripHexPrefix(txParams.data) || null,
      txParams.chainId,
      (response) => {
        if (response.success) {
          log.info('trezor signed tx')
          resolve({
            r: addHexPrefix(response.r),
            s: addHexPrefix(response.s),
            v: window.faast.web3.utils.numberToHex(response.v)
          })
        } else {
          if (response.error === 'Action cancelled by user') {
            toastr.error('Transaction was denied')
          } else {
            toastr.error(`Error from Trezor - ${response.error}`)
          }
          reject(new Error(response.error))
        }
      }
    )
  })
}

export const signWithLedger = (derivationPath, txParams) => {
  return new Promise((resolve, reject) => {
    let tx
    try {
      tx = new EthereumjsTx(txParams)
      tx.raw[6] = Buffer.from([txParams.chainId])
      tx.raw[7] = 0
      tx.raw[8] = 0
    } catch (e) {
      return reject(e)
    }

    window.faast.hw.ledger.signTransaction_async(derivationPath, RLP.encode(tx.raw))
    .then((result) => {
      log.info('ledger wallet signed tx')
      resolve({
        r: addHexPrefix(result.r),
        s: addHexPrefix(result.s),
        v: addHexPrefix(result.v)
      })
    })
    .fail((ex) => {
      if (ex === 'Invalid status 6a80') {
        toastr.error('Please enable "Contract data" in the Settings of the Ethereum Application and try again', {
          timeOut: 10000
        })
      } else if (ex === 'Invalid status 6985') {
        toastr.error('Transaction was denied')
      } else {
        if (typeof ex === 'string') {
          toastr.error(`Error from Ledger Wallet - ${ex}`)
        } else {
          if (ex.errorCode != null) {
            if (ex.errorCode === 5) {
              toastr.error('Transaction timed out, please try again')
            }
          }
        }
      }
      reject(ex)
    })
  })
}

export const signTxWithHardwareWallet = (type, derivationPath, txParams, isMocking) => {
  if (isMocking) return mockHardwareWalletSign(type)

  return new Promise((resolve, reject) => {
    let hwPromise
    switch (type) {
      case 'ledger':
        hwPromise = signWithLedger(derivationPath, txParams)
        break
      case 'trezor':
        hwPromise = signWithTrezor(derivationPath, txParams)
        break
      default:
        hwPromise = Promise.reject(new Error('unsupported hardware wallet'))
    }
    hwPromise.then((result) => {
      const signedTx = new EthereumjsTx(Object.assign({}, txParams, result)).serialize().toString('hex')
      resolve(signedTx)
    })
    .catch(reject)
  })
}

export const sendSignedTransaction = (signedTx) => {
  return window.faast.web3.eth.sendSignedTransaction(addHexPrefix(signedTx))
}

export const sendTransaction = (txObject, cb) => {
  return window.faast.web3.eth.sendTransaction(txObject, cb)
}

export const closeTrezorWindow = () => {
  if (window.faast.hw && window.faast.hw.trezor && window.faast.hw.trezor.close) window.faast.hw.trezor.close()
}

export const getTransactionReceipt = (txHash) => {
  return window.faast.web3.eth.getTransactionReceipt(txHash)
}

export const setWeb3 = (providerType) => {
  if (providerType === 'metamask' && typeof window.web3 !== 'undefined') {
    window.faast.web3 = new window.Web3(window.web3.currentProvider)
  } else {
    window.faast.web3 = new window.Web3(new window.Web3.providers.HttpProvider(config.web3Provider))
  }
}

export const restoreWallet = () => {
  if (blockstack.isUserSignedIn()) {
    return blockstack.restoreWallet()
  } else {
    return restoreWalletFromStorage()
  }
}
