import { isString, isObject, omitBy, isFunction } from 'lodash'
import queryString from 'query-string'

import idb from './idb'
import { dateNowString } from './helpers'
import config from 'Config'

const storeName = 'logging'

const query = queryString.parse(window.location.search)
if (query.log_level) window.faast.log_level = query.log_level

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
    .catch(() => false)) // Do nothing

const logger = {}

const logLevels = {
  error: 5,
  warn: 4,
  info: 3,
  debug: 2,
  trace: 1
}

const log = (level) => (text, ...data) => {
  const appLogLevel = window.faast.log_level || config.logLevel
  if (logLevels[level] >= logLevels[appLogLevel]) {
    console[level](text, ...data)
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
          return omitBy(item, isFunction)
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
        if (message.includes('store not ready')) {
          // Save any failed log messages until store is ready
          idbNotReadyQueue.push(payload)
        } else {
          console.error('Error writing to indexedDB -', err.message)
        }
      })
  }
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
