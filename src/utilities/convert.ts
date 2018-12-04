import EthereumjsUtil from 'ethereumjs-util'
import padLeft from 'pad-left'
import { addHexPrefix } from 'Utilities/helpers'
import { BigNumber, Numerical, TEN, toBigNumber } from './numbers'

export * from './numbers'

export function toTxFee(gasLimit: Numerical, gasPrice: Numerical): BigNumber {
  gasLimit = toBigNumber(gasLimit)
  gasPrice = toBigNumber(gasPrice)
  const power = TEN.toPower(18)
  return gasLimit.times(gasPrice).div(power)
}

export function toHex(value: Numerical): string {
  value = toBigNumber(value)
  return addHexPrefix(value.toString(16))
}

export function toChecksumAddress(address: string): string {
  return EthereumjsUtil.toChecksumAddress(address)
}

function formatTimePart(part: number): string {
  return padLeft(part.toString(), 2, '0')
}

export function secondsToTime(secs: number): { hours: string, minutes: string, seconds: string } {
  const hours = formatTimePart(Math.floor(secs / (60 * 60)))
  const divisorForMinutes = secs % (60 * 60)
  const minutes = formatTimePart(Math.floor(divisorForMinutes / 60))
  const divisorForSeconds = divisorForMinutes % 60
  const seconds = formatTimePart(Math.floor(divisorForSeconds))
  let timeObj: { hours: string, minutes: string, seconds: string } = { hours, minutes, seconds }
  // no negative
  if (parseInt(seconds) < 0) { timeObj = { hours: '0', minutes: '00', seconds: '00' } }
  return timeObj
}
