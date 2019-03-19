import { isString, isObject } from 'lodash'
import * as queryString from 'query-string'

import idb from './idb'
import { dateNowString } from './helpers'
import config from 'Config'

const storeName = 'logging'

const MAX_OBJECT_SIZE = 1024

export type LogLevel = 'error' | 'warn' | 'info' | 'log' | 'debug' | 'trace'

const LOG_LEVEL_PRIORITY = {
  error: 6,
  warn: 5,
  info: 4,
  log: 3,
  debug: 2,
  trace: 1,
}

interface LogPayload {
  level: LogLevel
  time: string
  message: string
  data?: any
}

let idbNotReadyQueue: LogPayload[] = []
let idbReady = false

export class Logger {

  constructor(public logLevel: LogLevel) {}

  _print(level: LogLevel, ...data: any[]) {
    if (LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.logLevel]) {
      console[level](...data)
    }
    let text = data[0]
    if (text instanceof Error) {
      text = text.toString()
    }
    if (!isString(text)) {
      text = ''
    } else {
      data = data.slice(1)
    }
    const now = dateNowString()
    const payload: LogPayload = {
      level,
      time: now,
      message: text,
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
    if (idbReady) {
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
    } else {
      idbNotReadyQueue.push(payload)
    }
  }

  error(...args: any[]) { this._print('error', ...args) }
  warn(...args: any[]) { this._print('warn', ...args) }
  info(...args: any[]) { this._print('info', ...args) }
  log(...args: any[]) { this._print('log', ...args) }
  debug(...args: any[]) { this._print('debug', ...args) }
  trace(...args: any[]) { this._print('trace', ...args) }
  errorInline<T>(text: string, data: T) { this.error(text, data); return data }
  warnInline<T>(text: string, data: T) { this.warn(text, data); return data }
  infoInline<T>(text: string, data: T) { this.info(text, data); return data }
  logInline<T>(text: string, data: T) { this.log(text, data); return data }
  debugInline<T>(text: string, data: T) { this.debug(text, data); return data }
  traceInline<T>(text: string, data: T) { this.trace(text, data); return data }
}

let query: any = {}
let appLogLevel = config.logLevel
if (typeof window !== 'undefined') {
  query = queryString.parse(window.location.search)
  appLogLevel = query.log_level || appLogLevel
}

const defaultLogger = new Logger(appLogLevel as LogLevel)

idb.setup([storeName])
  .then(() => {
    idbReady = true
    if (query.export) {
      defaultLogger.log(`exporting ${query.export} from idb`)
      return idb.exportDb(query.export)
    }
    defaultLogger.log('idb set up')
  })
  .then(() => idb.removeOld(storeName))
  // Push any log messages that occurred while setting up store
  .then(() => idbNotReadyQueue.reduce(
    (prev, message) => prev.then(() => idb.put(storeName, message)),
    Promise.resolve())
    .then(() => {
      defaultLogger.log(`Pushed ${idbNotReadyQueue.length} log messages to IDB`)
      idbNotReadyQueue = []
    })
    .catch((e) => defaultLogger.error(`Failed to push ${idbNotReadyQueue.length} log messages to IDB`, e)))

export default defaultLogger
