import b58 from 'bs58check'
import networks from 'Utilities/networks'

export function getBip32MagicNumber(bip32Prefix: string): string {
  for (const network of Object.values(networks)) {
    for (const paymentType of network.paymentTypes) {
      if (bip32Prefix === paymentType.bip32.public.b58) {
        return paymentType.bip32.public.hex
      }
      if (bip32Prefix === paymentType.bip32.private.b58) {
        return paymentType.bip32.private.hex
      }
    }
  }
  throw new Error(`Cannot get bip32 magic number for ${bip32Prefix}`)
}

/**
 * Converts prefix of bip32 extended public/private keys
 * Source: https://github.com/bitcoinjs/bitcoinjs-lib/issues/966
 */
export function convertBip32Prefix(encoded: string, newPrefix: string) {
  let data = b58.decode(encoded)
  data = data.slice(4)
  data = Buffer.concat([Buffer.from(getBip32MagicNumber(newPrefix), 'hex'), data])
  return b58.encode(data)
}

export const toXpub = (bip32key: string) => convertBip32Prefix(bip32key, 'xpub')
export const toYpub = (bip32key: string) => convertBip32Prefix(bip32key, 'ypub')

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
