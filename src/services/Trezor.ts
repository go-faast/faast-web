import {
  ResponseSuccess,
  ResponseMessage,
  Input,
  Output,
  PublicKey,
  SignedTransaction,
  EthereumSignedTransaction,
} from 'trezor-connect'

// tslint:disable-next-line:no-var-requires
const TrezorConnect = require('trezor-connect').default

import log from 'Utilities/log'
import { NetworkConfig } from 'Utilities/networks'
import {
  convertHdKeyPrefixForPath, getHdKeyPrefix,
  derivationPathStringToArray, getPaymentTypeForPath,
} from 'Utilities/bitcoin'
import { toHex } from 'Utilities/convert'
import { PaymentTx } from 'Services/Bitcore'
import { HdAccount } from 'Types'
import { AddressFormat } from 'Utilities/addressFormat'
import { bchCashAddrFormat } from 'Utilities/addressFormat/assets/BCH'

export {
  Input as TrezorInput,
  Output as TrezorOutput,
  PublicKey as TrezorPublicKey,
  SignedTransaction as TrezorSignedTransaction,
  EthereumSignedTransaction as TrezorEthereumSignedTransaction,
}

TrezorConnect.manifest({
  email: 'dev@faa.st',
  appUrl: 'https://faa.st/app',
})

const requiredAddressFormats: { [symbol: string]: AddressFormat } = {
  BCH: bchCashAddrFormat,
}

export function convertAddressFormat(assetSymbol: string, address: string): string {
  const format = requiredAddressFormats[assetSymbol]
  if (format) {
    return format.convert(address)
  }
  return address
}

function isResultSuccess<T>(result: ResponseMessage<T>): result is ResponseSuccess<T> {
  return result.success === true
}

function handleResult<T>(result: ResponseMessage<T>): T {
  if (isResultSuccess(result)) {
    return result.payload
  }
  throw new Error(result.payload.error || 'Unknown error calling TrezorConnect')
}

export class TrezorService {

  getXPubKey(assetSymbol: string, derivationPath: string): Promise<PublicKey> {
    return TrezorConnect.getPublicKey(log.debugInline('TrezorConnect.getPublicKey', {
      coin: assetSymbol.toLowerCase(),
      path: derivationPath,
    })).then(handleResult)
  }

  signTx(assetSymbol: string, inputs: Input[], outputs: Output[]): Promise<SignedTransaction> {
    return TrezorConnect.signTransaction(log.debugInline('TrezorConnect.signTransaction', {
      coin: assetSymbol.toLowerCase(),
      inputs,
      outputs,
    })).then(handleResult)
  }

  signEthereumTx(
    derivationPath: string,
    tx: {
      to: string,
      value: string | number,
      gasPrice: string | number,
      gas: string | number,
      nonce: string | number,
      data?: string,
      chainId?: number,
    },
  ): Promise<EthereumSignedTransaction> {
    const { to, value, gas, gasPrice, nonce, data, chainId } = tx
    return TrezorConnect.ethereumSignTransaction(log.debugInline('TrezorConnect.ethereumSignTransaction', {
      path: derivationPath,
      transaction: {
        to,
        value: toHex(value),
        gasLimit: toHex(gas),
        gasPrice: toHex(gasPrice),
        nonce: toHex(nonce),
        data,
        chainId,
      },
    })).then(handleResult)
  }

  getHdAccount(network: NetworkConfig, derivationPath: string): Promise<HdAccount> {
    const assetSymbol = network.symbol
    log.debug('Trezor.getHdAccount', assetSymbol, derivationPath)
    return this.getXPubKey(assetSymbol, derivationPath)
      .then((result) => {
        log.debug(`Trezor.getXPubKey for ${assetSymbol} success`)
        const { xpub, serializedPath } = result
        let normalizedPath = serializedPath
        if (!normalizedPath.startsWith('m/') && /^\d/.test(normalizedPath)) {
          normalizedPath = `m/${normalizedPath}`
        }
        const normalizedXpub = convertHdKeyPrefixForPath(xpub, normalizedPath, network)
        if (normalizedXpub !== xpub) {
          log.debug(`Converted Trezor xpubkey from ${getHdKeyPrefix(xpub)} to ${getHdKeyPrefix(normalizedXpub)}`)
        }
        return {
          xpub: normalizedXpub,
          path: normalizedPath,
        }
      })
  }

  signPaymentTx(
    network: NetworkConfig,
    derivationPath: string,
    txData: PaymentTx,
  ): Promise<{ signedTxData: string }> {
    log.debug('Trezor.signPaymentTx', network.symbol, derivationPath, txData)
    return Promise.resolve().then(() => {
      const assetSymbol = network.symbol
      const { inputUtxos, outputs, change, changePath } = txData
      const baseDerivationPathArray = derivationPathStringToArray(derivationPath)
      const addressEncoding = getPaymentTypeForPath(derivationPath, network).addressEncoding
      if (!(['P2PKH', 'P2SH-P2WPKH'].includes(addressEncoding))) {
        throw new Error(`Trezor.signBitcoreTx does not support ${assetSymbol} `
          + `accounts using ${addressEncoding} encoding`)
      }
      const isSegwit = addressEncoding !== 'P2PKH'
      const addressFormat = requiredAddressFormats[assetSymbol]
      const trezorInputs: Input[] = inputUtxos.map(({ addressPath, transactionHash, index, value }) => ({
        address_n: baseDerivationPathArray.concat(addressPath),
        prev_hash: transactionHash,
        prev_index: index,
        amount: value.toString(),
        ...(isSegwit ? {
          script_type: 'SPENDP2SHWITNESS',
        } : {}),
      }))
      const trezorOutputs: Output[] = outputs.map(({ address, amount }) => ({
        address: convertAddressFormat(assetSymbol, address),
        amount: amount.toString(),
        script_type: 'PAYTOADDRESS',
      }))
      if (change > 0) {
        trezorOutputs.push({
          address_n: baseDerivationPathArray.concat(changePath),
          amount: change.toString(),
          script_type: isSegwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS',
        })
      }
      return this.signTx(assetSymbol, trezorInputs, trezorOutputs)
        .then((result) => {
          log.info('Trezor transaction signed', result)
          const { serializedTx: signedTxData } = result
          return {
            signedTxData,
          }
        })
    })
  }

  cancel(): void {
    TrezorConnect.cancel()
  }
}

const defaultService = new TrezorService()

export default defaultService
