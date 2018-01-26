import b58 from 'bs58check'

const magicNumber = {
  xpub: '0x0488b21e',
  ypub: '0x049d7cb2'
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

export default {
  magicNumber,
  ypubToXpub,
  xpubToYpub
}