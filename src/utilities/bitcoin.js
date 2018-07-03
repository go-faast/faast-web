import b58 from 'bs58check'

const magicNumber = {
  xpub: '0488b21e',
  ypub: '049d7cb2'
}

/** Takes ypub and turns into xpub
  * Source: https://github.com/bitcoinjs/bitcoinjs-lib/issues/966
  */
function b58convert(encoded, newMagicNumber) {
  let data = b58.decode(encoded)
  data = data.slice(4)
  data = Buffer.concat([Buffer.from(newMagicNumber, 'hex'), data])
  return b58.encode(data)
}

export const ypubToXpub = (ypub) => b58convert(ypub, magicNumber.xpub)
export const xpubToYpub = (xpub) => b58convert(xpub, magicNumber.ypub)

/**
 * Estimate size of transaction a certain number of inputs and outputs.
 * This function is based off of ledger-wallet-webtool/src/TransactionUtils.js#estimateTransactionSize
 */
export function estimateTxSize(inputsCount, outputsCount, handleSegwit) {
  var maxNoWitness,
    maxSize,
    maxWitness,
    minNoWitness,
    minSize,
    minWitness,
    varintLength;
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
    max: maxSize
  };
}

export function estimateTxFee(satPerByte, inputsCount, outputsCount, handleSegwit) {
  const { min, max } = estimateTxSize(inputsCount, outputsCount, handleSegwit)
  const mean = Math.ceil((min + max) / 2)
  return mean * satPerByte
}

/** Join a base derivation path string with an integer array subpath */
export function joinDerivationPath(basePathString, subPath) {
  return `${basePathString}/${subPath.join('/')}`
}

export default {
  magicNumber,
  ypubToXpub,
  xpubToYpub,
  estimateTxSize,
  estimateTxFee,
  joinDerivationPath,
}
