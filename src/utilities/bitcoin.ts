import b58 from 'bs58check'
import bitcoin, { Network as BitcoinJsNetwork } from 'bitcoinjs-lib'
import networks, { NetworkConfig, PaymentType, AddressEncoding, BTC } from 'Utilities/networks'

const getHdKeyPrefix = (hdKey: string): string => hdKey.slice(0, 4)

export function getPaymentTypeForPrefix(bip32Prefix: string, network: NetworkConfig): PaymentType {
  const paymentType = network.paymentTypes.find((pt) =>
    bip32Prefix === pt.bip32.public.b58 || bip32Prefix === pt.bip32.private.b58)
  if (!paymentType) {
    throw new Error(`Cannot find ${network.name} PaymentType for prefix ${bip32Prefix}`)
  }
  return paymentType
}

export function getPaymentTypeForEncoding(encoding: AddressEncoding, network: NetworkConfig): PaymentType {
  const paymentType = network.paymentTypes.find((pt) => pt.addressEncoding === encoding)
  if (!paymentType) {
    throw new Error(`Cannot find ${network.name} PaymentType for encoding ${encoding}`)
  }
  return paymentType
}

export function isPublicPrefix(bip32Prefix: string, paymentType: PaymentType): boolean {
  if (bip32Prefix === paymentType.bip32.public.b58) {
    return true
  }
  if (bip32Prefix === paymentType.bip32.private.b58) {
    return false
  }
  throw new Error(`PaymentType ${paymentType.addressEncoding} not compatible with bip32 prefix ${bip32Prefix}`)
}

/**
 * Converts prefix of bip32 extended public/private keys
 * Source: https://github.com/bitcoinjs/bitcoinjs-lib/issues/966
 */
export function convertHdKeyAddressEncoding(
  hdKey: string,
  newEncoding: AddressEncoding,
  network: NetworkConfig,
): string {
  let data = b58.decode(hdKey)
  data = data.slice(4)
  const prefix = getHdKeyPrefix(hdKey)
  const currentPaymentType = getPaymentTypeForPrefix(prefix, network)
  const newPaymentType = getPaymentTypeForEncoding(newEncoding, network)
  const isPublic = isPublicPrefix(prefix, currentPaymentType)
  const newMagicNumber = isPublic ? newPaymentType.bip32.public : newPaymentType.bip32.private
  data = Buffer.concat([Buffer.from(newMagicNumber.hex, 'hex'), data])
  return b58.encode(data)
}

export const toXpub = (hdKey: string) => convertHdKeyAddressEncoding(hdKey, 'P2PKH', BTC)
export const toYpub = (hdKey: string) => convertHdKeyAddressEncoding(hdKey, 'P2SH-P2WPKH', BTC)

const paymentEncoders: {
  [encoding in AddressEncoding]: (args: object, opts?: object) => { address?: string }
} = {
  'P2PKH': bitcoin.payments.p2pkh,
  'P2SH-P2WPKH': (args: object, opts?: object) => bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh(args, opts),
  }),
  'P2WPKH': bitcoin.payments.p2wpkh,
  'P2SH-P2WSH': (args: object, opts?: object) => bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wsh(args, opts),
  }),
  'P2WSH': bitcoin.payments.p2wsh,
}

export function encodeAddress(pubKey: Buffer, encoding: AddressEncoding, network: NetworkConfig): string {
  const paymentEncoder = paymentEncoders[encoding]
  const { bitcoinJsNetwork } = network
  return paymentEncoder({ pubkey: pubKey, network: bitcoinJsNetwork }).address
}

export function deriveAddress(hdKey: string, path: number[], network: NetworkConfig): string {
  let hdNode = bitcoin.bip32.fromBase58(hdKey)
  for (const i of path) {
    hdNode = hdNode.derive(i)
  }
  const paymentType = getPaymentTypeForPrefix(getHdKeyPrefix(hdKey), network)
  return encodeAddress(hdNode.publicKey, paymentType.addressEncoding, network)
}

/**
 * Estimate size of transaction a certain number of inputs and outputs.
 * This function is based off of ledger-wallet-webtool/src/TransactionUtils.js#estimateTransactionSize
 */
export function estimateTxSize(
  inputsCount: number,
  outputsCount: number,
  handleSegwit: boolean,
): { min: number, max: number } {
  let maxNoWitness
  let maxSize
  let maxWitness
  let minNoWitness
  let minSize
  let minWitness
  let varintLength
  if (inputsCount < 0xfd) {
    varintLength = 1;
  } else if (inputsCount < 0xffff) {
    varintLength = 3;
  } else {
    varintLength = 5;
  }
  if (handleSegwit) {
    minNoWitness =
      varintLength + 4 + 2 + 59 * inputsCount + 1 + 31 * outputsCount + 4;
    maxNoWitness =
      varintLength + 4 + 2 + 59 * inputsCount + 1 + 33 * outputsCount + 4;
    minWitness =
      varintLength +
      4 +
      2 +
      59 * inputsCount +
      1 +
      31 * outputsCount +
      4 +
      106 * inputsCount;
    maxWitness =
      varintLength +
      4 +
      2 +
      59 * inputsCount +
      1 +
      33 * outputsCount +
      4 +
      108 * inputsCount;
    minSize = (minNoWitness * 3 + minWitness) / 4;
    maxSize = (maxNoWitness * 3 + maxWitness) / 4;
  } else {
    minSize = varintLength + 4 + 146 * inputsCount + 1 + 31 * outputsCount + 4;
    maxSize = varintLength + 4 + 148 * inputsCount + 1 + 33 * outputsCount + 4;
  }
  return {
    min: minSize,
    max: maxSize,
  };
}

export function estimateTxFee(
  satPerByte: number,
  inputsCount: number,
  outputsCount: number,
  handleSegwit: boolean,
): number {
  const { min, max } = estimateTxSize(inputsCount, outputsCount, handleSegwit)
  const mean = Math.ceil((min + max) / 2)
  return mean * satPerByte
}

/** Join a base derivation path string with an integer array subpath */
export function joinDerivationPath(basePathString: string, subPath: number[]): string {
  return `${basePathString}/${subPath.join('/')}`
}

export function derivationPathStringToArray(derivationPath: string): number[] {
  return derivationPath
    .replace('m/', '')
    .split('/')
    .map((index) => index.endsWith('\'')
      ? Number.parseInt(index.substring(0, index.length - 1)) | 0x80000000
      : Number.parseInt(index))
}

export default {
  toXpub,
  toYpub,
  estimateTxSize,
  estimateTxFee,
  joinDerivationPath,
}
