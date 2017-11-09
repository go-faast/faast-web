import pad from 'pad-left'

export const uppercase = (str) => {
  if (typeof str !== 'string') return str
  return str.toUpperCase()
}

export const lowercase = (str) => {
  if (typeof str !== 'string') return str
  return str.toLowerCase()
}

export const filterErrors = (err) => {
  const genericError = 'Sorry, there was a problem with your request'
  if (!err || !err.message) return genericError
  console.error('ERROR:', err.message)
  switch (err.message) {
    case 'Please enter a valid address':
    case 'Please enter a valid address or change the exchange type':
      return 'Please enter a valid receiving address'
    case 'Warning: Return address appears to be invalid for the deposit coin type.':
      return 'Please enter a valid refund address'
    case 'Please enter a valid address ( invalid characters )':
      return 'Please enter a valid address'
    case 'Invalid Ethereum Address':
      return err.message
    case 'inactive':
      return 'Sorry, the exchange is unavailable at this time. Please try again later'
    default:
      return genericError
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
export const storageAvailable = (type) => {
  try {
    var storage = window[type]
    var x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return e instanceof window.DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
  }
}

export const sessionStorageSet = (key, value) => {
  sessionStorageClear()
  if (storageAvailable('sessionStorage')) {
    window.sessionStorage.setItem(key, value)
  }
}

export const sessionStorageGet = (key) => {
  if (storageAvailable('sessionStorage')) {
    return window.sessionStorage.getItem(key)
  } else {
    return null
  }
}

export const sessionStorageClear = () => {
  if (storageAvailable('sessionStorage')) {
    window.sessionStorage.clear()
  }
}

export const shortener = (str, chars = 1) => {
  if (typeof str !== 'string') return str
  if (str.length <= chars) return str
  return str.slice(0, chars) + '...'
}

export const getSwapStatus = (swap) => {
  if (swap.error) {
    if (swap.error.message && swap.error.message.startsWith('Returned error: Insufficient funds')) {
      return {
        status: 'error',
        details: 'insufficient funds'
      }
    }
    return {
      status: 'error',
      details: 'unable to send transaction'
    }
  }
  if (swap.fee == null) {
    return {
      status: 'working',
      details: 'fetching swap details'
    }
  }
  if (swap.order == null) {
    return {
      status: 'working',
      details: 'creating swap order'
    }
  }
  if (swap.order.error) {
    return {
      status: 'error',
      details: typeof swap.order.error === 'string' ? swap.order.error : 'swap order error'
    }
  }
  if (swap.tx == null) {
    return {
      status: 'working',
      details: 'generating transaction'
    }
  }
  if (swap.tx.gasPrice == null) {
    return {
      status: 'working',
      details: 'fetching gas details'
    }
  }
  if (swap.tx.signed == null) {
    return {
      status: 'waiting',
      details: 'waiting for transaction to be signed'
    }
  }
  if (swap.tx.receipt == null) {
    return {
      status: 'working',
      details: 'sending signed transaction'
    }
  }
  if ((swap.order.status == null || swap.order.status === 'no_deposits') && (swap.tx.confirmations == null || swap.tx.confirmations < 1)) {
    return {
      status: 'working',
      details: 'waiting for confirmations'
    }
  }
  if (swap.order.status == null || swap.order.status !== 'complete') {
    return {
      status: 'working',
      details: 'processing swap'
    }
  }
  return {
    status: 'complete',
    details: 'complete'
  }
}

export const statusAllSwaps = (swapList) => {
  if (!swapList || !swapList.length) return 'unavailable'
  const someSigned = swapList.some((send) => {
    return send.list.some((receive) => {
      return receive.tx.signed
    })
  })
  if (!someSigned) return 'unsigned'
  const finalized = swapList.every((send) => {
    return send.list.every((receive) => {
      return receive.order && (receive.order.status === 'complete' || receive.order.status === 'failed')
    })
  })
  if (finalized) {
    return 'finalized'
  } else {
    return 'pending'
  }
}

export const timer = (seconds = 1, cb, done) => {
  let thisTimer
  thisTimer = window.setInterval(() => {
    seconds -= 1
    if (seconds <= 0) {
      window.clearInterval(thisTimer)
      done()
    } else {
      cb(seconds)
    }
  }, 1000)
  return thisTimer
}

export const processArray = (array, fn) => {
  const results = []
  return array.reduce((p, item) => {
    return p.then(() => {
      return fn(item).then((data) => {
        results.push(data)
        return results
      })
    })
  }, Promise.resolve())
}

export const stripHexPrefix = (hex) => {
  if (typeof hex !== 'string') hex = String(hex)
  if (hex.slice(0, 2) === '0x') hex = hex.slice(2)
  if (hex.length % 2 !== 0) hex = `0${hex}`
  return hex
}

export const addHexPrefix = (hex) => {
  if (typeof hex !== 'string') hex = String(hex)
  if (hex.slice(0, 2) === '0x') return hex
  return `0x${hex}`
}

export const dateNowString = (splitSep = ' ', timeSep = ':') => {
  const d = new Date()
  const year = d.getUTCFullYear()
  const month = pad(d.getUTCMonth(), 2, '0')
  const date = pad(d.getUTCDate(), 2, '0')
  const hour = pad(d.getUTCHours(), 2, '0')
  const minutes = pad(d.getUTCMinutes(), 2, '0')
  const seconds = pad(d.getUTCSeconds(), 2, '0')
  return `${year}-${month}-${date}${splitSep}${hour}${timeSep}${minutes}${timeSep}${seconds}`
}

export const updateObjectInArray = (array, payload) => (
  array.map((item, index) => {
    if (index !== payload.index) return item

    return Object.assign({}, item, payload.item)
  })
)

export const downloadJson = (obj, fileName, noExtension) => {
  return new Promise((resolve, reject) => {
    let jsonString
    try {
      jsonString = JSON.stringify(obj)
    } catch (e) {
      return reject(e)
    }

    const blob = new window.Blob([jsonString], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    if (noExtension) {
      a.download = fileName
    } else {
      a.download = `${fileName}.json`
    }
    a.href = url
    a.click()
    resolve(jsonString)
  })
}

export const sortByProperty = (arr, prop) => {
  const propYes = arr.filter((val) => {
    return val[prop]
  })
  const propNo = arr.filter((val) => {
    return !val[prop]
  })
  return propYes.concat(propNo)
}

export const chunkify = (arr, size) => {
  let chunked = []
  if (size) {
    for (let i = 0, j = arr.length; i < j; i += size) {
      chunked.push(arr.slice(i, i + size))
    }
  }
  return chunked
}

export const filterObj = (filterList = [], obj = {}) => {
  const returnObj = {}
  if (!Array.isArray(filterList) || typeof obj !== 'object') return returnObj
  filterList.forEach((item) => {
    if (obj.hasOwnProperty(item)) returnObj[item] = obj[item]
  })
  return returnObj
}

export const fixPercentageRounding = (list, total) => {
  // an attempt to remedy situations where
  // total percentage amounts equal 101% due to rounding
  // i.e. total = 1400, values = [550.01, 549.99, 300]
  const sum = list.reduce((prev, curr) => {
    return prev + parseInt(curr.percentage)
  }, 0)
  if (sum === 10001) {
    const toAdjust = list.map((a) => {
      // const p = a.fiat.number / total * 1e4
      const p = a.fiat.dividedBy(total).times(1e4)
      // return { symbol: a.symbol, num: p - Math.trunc(p) }
      return { symbol: a.symbol, num: p.minus(p.trunc()).toNumber() }
    }).filter((a) => a.num > 0.5).sort((a, b) => a.num - b.num)
    const adjustIndex = list.findIndex((a) => a.symbol === toAdjust[0].symbol)
    return list.map((item, index) => {
      if (index !== adjustIndex) return item
      return Object.assign({}, item, {
        percentage: item.percentage.minus(1).round().toString()
      })
    })
  } else {
    return list
  }
}
