import { isString, isObject } from 'lodash'
import * as queryString from 'query-string'

import idb from './idb'
import { dateNowString } from './helpers'
import config from 'Config'

const storeName = 'logging'

const MAX_OBJECT_SIZE = 1024

let query = {}
let appLogLevel = config.logLevel
if (typeof window !== 'undefined') {
  query = queryString.parse(window.location.search)
  appLogLevel = query.log_level || appLogLevel
}

let idbNotReadyQueue = []

idb.setup([storeName])
  .then(() => {
    console.log('idb set up')
    if (query.export) {
      return idb.exportDb(query.export)
    }
  })
  .then(() => idb.removeOld(storeName))
  // Push any log messages that occurred while setting up store
  .then(() => idbNotReadyQueue.reduce(
    (prev, message) => prev.then(() => idb.put(storeName, message)),
    Promise.resolve())
    .then(() => {
      console.log(`Pushed ${idbNotReadyQueue.length} log messages to IDB`)
      idbNotReadyQueue = []
    })
    .catch((e) => console.error(`Failed to push ${idbNotReadyQueue.length} log messages to IDB`, e)))

const logger = {}

const logLevels = {
  error: 5,
  warn: 4,
  info: 3,
  debug: 2,
  trace: 1
}

const log = (level) => (text, ...data) => {
  if (logLevels[level] >= logLevels[appLogLevel]) {
    console[level](text, ...data)
  }
  if (text instanceof Error) {
    text = text.toString()
  }
  if (!isString(text)) {
    data = [text, ...data]
    text = ''
  }
  const now = dateNowString()
  const payload = {
    level,
    time: now,
    message: text
  }
  if (data && data.length > 0) {
    data = data.map((item) => {
      if (item instanceof Error) {
        return item.toString()
      }
      if (isObject(item)) {
        const strObj = JSON.stringify(item)
        if (strObj.length > MAX_OBJECT_SIZE) {
          return strObj.slice(0, MAX_OBJECT_SIZE)
        } else {
          return strObj
        }
      }
      return item
    })
    if (data.length === 1) {
      data = data[0]
    }
    payload.data = data
  }
  idb.put(storeName, payload)
    .catch((err) => {
      const { message } = err
      if (message && message.includes('store not ready')) {
        // Save any failed log messages until store is ready
        idbNotReadyQueue.push(payload)
      } else {
        console.error('Error writing to indexedDB -', err.message)
      }
    })
}

const logInline = (level) => (text, ...data) => {
  logger[level](text, ...data)
  // Return the last argument
  if (data.length > 0) {
    return data[data.length - 1]
  } else {
    return text
  }
}

Object.keys(logLevels).forEach((level) => {
  logger[level] = log(level)
  logger[`${level}Inline`] = logInline(level)
})

export default logger
