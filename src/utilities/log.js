import idb from './idb'
import { dateNowString } from './helpers'

const logLevelInt = (level) => {
  switch (level) {
  case 'error':
    return 5
  case 'warn':
    return 4
  case 'info':
    return 3
  case 'debug':
    return 2
  case 'trace':
    return 1
  }
}

const log = (level, text, data) => {
  const appLogLevel = window.faast.log_level || 'info'
  if (logLevelInt(level) >= logLevelInt(appLogLevel)) {
    console[level](text)
    if (text instanceof Error) text = text.message
    const now = dateNowString()
    if (data) {
      console[level](data)
    }
    const payload = {
      level,
      time: now,
      message: text
    }
    if (data) payload.data = data
    idb.put('logging', payload)
    .catch((err) => {
      console.error('Error writing to indexedDB -', err.message)
    })
  }
}

export default {
  trace: (msg, data) => log('trace', msg, data),
  debug: (msg, data) => log('debug', msg, data),
  info: (msg, data) => log('info', msg, data),
  warn: (msg, data) => log('warn', msg, data),
  error: (msg, data) => log('error', msg, data)
}
