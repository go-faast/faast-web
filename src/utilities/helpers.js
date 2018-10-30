import pad from 'pad-left'
import queryString from 'query-string'
import { mergeWith, union, without, omit, identity } from 'lodash'
import sha256 from 'hash.js/lib/hash/sha/256'
import baseX from 'base-x'
import urlJoin from 'url-join'

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getDate = (item, dateField) => {
  let d = typeof item === 'object' && item !== null && item[dateField]
  if (!d) { return 0 }
  if (!(d instanceof Date)) {
    d = new Date(d)
  }
  return d.getTime()
}

export const dateSort = (items, dir, dateField) => items
  .sort((a, b) => (dir === 'desc' ? -1 : 1) * (getDate(a, dateField) - getDate(b, dateField)))

export const bs62 = baseX('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')

export const toHashId = (s) => bs62.encode(Buffer.from(sha256().update(s).digest().slice(0, 16)))

export const routerPathToUri = (routerPath) => urlJoin(window.location.origin, process.env.ROUTER_BASE_NAME, routerPath)

export const splice = (arr, ...args) => {
  const spliced = [...arr]
  spliced.splice(...args)
  return spliced
}

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

export const shortener = (str, chars = 1, ellipsis = true) => {
  if (typeof str !== 'string') return str
  if (str.length <= chars) return str
  return str.slice(0, chars) + (ellipsis ? '...' : '')
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
  return array.reduce((p, item) => p
    .then(() => fn(item))
    .then((data) => {
      results.push(data)
      return results
    }),
  Promise.resolve())
}

export const stripHexPrefix = (hex) => {
  if (typeof hex !== 'string') hex = String(hex)
  if (hex.slice(0, 2) === '0x') hex = hex.slice(2)
  if (hex.length % 2 !== 0) hex = `0${hex}`
  return hex
}

export const addHexPrefix = (hex) => {
  if (typeof hex !== 'string') hex = String(hex)
  if (hex.startsWith('0x')) return hex
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

export const sortByProperty = (arr, prop, ...moreProps) => {
  let pass = []
  const fail = []
  arr.forEach((val) => {
    if (val[prop]) {
      pass.push(val)
    } else {
      fail.push(val)
    }
  })
  if (moreProps.length > 0) {
    pass = sortByProperty(pass, ...moreProps)
  }
  return fail.concat(pass)
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

export const filterUrl = () => {
  const query = queryString.parse(window.location.search)
  delete query.authResponse
  let newSearch = queryString.stringify(query)
  if (newSearch) newSearch = '?' + newSearch
  return window.location.origin + window.location.pathname + newSearch
}

export const promisifySync = (syncFn) => (...args) => new Promise((resolve, reject) => {
  try {
    resolve(syncFn(...args))
  } catch (err) {
    reject(err)
  }
})

export const parseJson = (jsonStr) => {
  try {
    return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
  } catch (_) {
    return null
  }
}

export const stringifyJson = (obj) => {
  try {
    return typeof obj !== 'string' ? JSON.stringify(obj) : obj
  } catch (_) {
    return ''
  }
}

export const makeEnum = (fields) => Object.freeze(fields.reduce((o, f) => ({ ...o, [f]: Symbol(f) })))

export const mapValues = (obj, valueMapper) => Object.entries(obj).reduce((result, [key, val]) => {
  result[key] = valueMapper(val, key)
  return result
}, {})


const mergeOps = {
  object: {
    $omit: (oldVal, newVal) => omit(oldVal, newVal)
  },
  array: {
    $set: (oldVal, newVal) => newVal,
    $union: (oldVal, newVal) => union(oldVal, newVal),
    $without: (oldVal, newVal) => without(oldVal, ...newVal),
    $append: (oldVal, newVal) => [...oldVal, ...newVal],
    $prepend: (oldVal, newVal) => [...newVal, ...oldVal],
  }
}

const isObj = (o) => typeof o === 'object' && o !== null

const getType = (x) => {
  if (x === null) {
    return 'null'
  } else if (Array.isArray(x)) {
    return 'array'
  } else {
    return typeof x
  }
}

const applyMergeOps = (oldVal, newVal) => {
  if (isObj(newVal)) {
    const ops = Object.keys(newVal)
    const [op] = ops
    const oldValType = getType(oldVal)
    const opFns = mergeOps[oldValType]
    if (ops.length === 1 && op.startsWith('$') && opFns) {
      const opFn = opFns[op]
      if (!opFn) {
        throw new Error(`Invalid ${oldValType} merge op ${op}`)
      }
      return opFn(oldVal, newVal[op])
    }
  } else if (Array.isArray(newVal)) {
    return newVal
  }
}

export const merge = (state, ...newStates) => newStates.reduce((result, newState) => {
  const updatedState = applyMergeOps(result, newState)
  if (updatedState) {
    return updatedState
  }
  return mergeWith({}, result, newState, applyMergeOps)
}, { ...state })

export const createMergeByField = (field) => (state, ...items) => merge(state, ...items.map((item) => ({ [item[field]]: item })))

export const mergeById = createMergeByField('id')

export const createUpserter = (indexField, defaultItemState, normalizeKey = identity) => (state, item) => {
  const id = normalizeKey(item[indexField])
  return {
    ...state,
    [id]: {
      ...(state[item[indexField]] || defaultItemState),
      ...item,
      [indexField]: id,
    }
  }
}

export const createUpdater = (indexField, normalizeKey = identity) => (state, item) => {
  const id = normalizeKey(item[indexField])
  const existingItem = state[id]
  return !existingItem ? state : {
    ...state,
    [id]: {
      ...existingItem,
      ...item,
      [indexField]: id,
    }
  }
}

export const reduceByKey = (objects, reduce, defaultValue) => {
  const result = {}
  objects.forEach((o) => {
    Object.entries(o).forEach(([k, v]) => {
      const current = result[k]
      result[k] = typeof current !== 'undefined' ? reduce(current, v) : reduce(defaultValue, v)
    })
  })
  return result
}

export const isIterable = (o) => o != null && typeof o[Symbol.iterator] === 'function'
