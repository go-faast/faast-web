import accounting from 'accounting'

export const fiat = (value) => {
  return accounting.formatMoney(value)
}

export const percentage = (value, showPositive, decimalPlaces = 2) => {
  const rounded = accounting.toFixed(value, decimalPlaces)

  if (showPositive && value > 0) return `+${rounded}%`
  return `${rounded}%`
}

export const ellipsize = (str, maxStartChars = 0, maxEndChars = 0) => {
  if (maxStartChars === 0 && maxEndChars === 0) {
    return str
  }
  if (str.length <= maxStartChars + maxEndChars) {
    return str
  }
  return `${str.slice(0, maxStartChars)}…${str.slice(str.length - maxEndChars)}`
}

export const sliceWalletAddress = (address = '', numOfParts = 0) => {
  var s = Math.ceil(address.length / numOfParts);
  var n = Math.ceil(2 * address.length / numOfParts);
  //keep track of initial 's' value for later use
  var interval = s;
  var splitAddress = '';
  for (var i = 0; i < numOfParts; i++) {
    //line break for each but last iteration
    var brHtml = i == numOfParts - 1 ? '' : '</br>'
    // if i = 0 then: n = s and s = 0 otherwise keep adding interval
    n = i == 0 ? s : interval + n
    s = i == 0 ? 0 : interval + s
    splitAddress += `${address.slice(s,n)}${brHtml}`
    if (i == numOfParts - 1) {
      return { __html: `${splitAddress}` }
    }
  }
}

export default {
  fiat,
  percentage,
  ellipsize,
  sliceWalletAddress
}
