import accounting from 'accounting'
import { isRegExp, escapeRegExp, isString, flatten } from 'lodash'

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

export const formatDate = (date, format) => {
  if (!date) {
    return
  }
  date = date instanceof Date ? date : new Date(date)
  var dateObj = {
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds()
  }
  format = format.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
    return ((v.length > 1 ? '0' : '') + dateObj[v.slice(-1)]).slice(-2)
  })
  
  return format.replace(/(y+)/g, function(v) {
    return date.getFullYear().toString().slice(-v.length)
  })
}

export const formatDateToWords = (date) => {
  if (!date) {
    return
  }
  date = new Date(date)
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ]

  const day = date.getDate()
  const monthIndex = date.getMonth()
  const year = date.getFullYear()

  return `${months[monthIndex]} ${day}, ${year}`
}

const replaceString = (str, match, fn) => {
  var curCharStart = 0
  var curCharLen = 0

  if (str === '') {
    return str
  } else if (!str || !isString(str)) {
    throw new TypeError('First argument to react-string-replace#replaceString must be a string')
  }

  var re = match

  if (!isRegExp(re)) {
    re = new RegExp('(' + escapeRegExp(re) + ')', 'gi')
  }

  var result = str.split(re)

  // Apply fn to all odd elements
  for (var i = 1, length = result.length; i < length; i += 2) {
    curCharLen = result[i].length
    curCharStart += result[i - 1].length
    result[i] = fn(result[i], i, curCharStart)
    curCharStart += curCharLen
  }

  return result
}

export const replaceStringWithJSX = (source, match, fn) => {
  if (!Array.isArray(source)) source = [source]

  return flatten(source.map(function(x) {
    return isString(x) ? replaceString(x, match, fn) : x
  }))
}

export const getTimeSinceDate = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) {
    return interval + ' years'
  }
  interval = Math.floor(seconds / 2592000)
  if (interval == 1) {
    return '1 month'
  } else if (interval > 1 && interval <= 11) {
    return ` ${Math.floor(interval % 2592000)} months`
  }
  interval = Math.floor(seconds / 604800)
  if (interval == 1) {
    return '1 week'
  } else if (interval > 1 && interval < 4) {
    return ` ${Math.floor(interval % 604800)} weeks`
  }
  interval = Math.floor(seconds / 86400)
  if (interval > 1) {
    return interval + ' days'
  }
  interval = Math.floor(seconds / 3600)
  if (interval > 1) {
    return interval + ' hours'
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + ' minutes'
  }
  return Math.floor(seconds) + ' seconds';
}

export default {
  fiat,
  percentage,
  ellipsize,
  formatDate,
  formatDateToWords,
  replaceStringWithJSX
}
