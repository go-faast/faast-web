import idb from './idb'
import { dateNowString } from './helpers'

const logger = {}

const logLevels = {
  error: 5,
  warn: 4,
  info: 3,
  debug: 2,
  trace: 1
}

const log = (level) => (text, ...data) => {
  const appLogLevel = window.faast.log_level || 'info'
  if (logLevels[level] >= logLevels[appLogLevel]) {
    console[level](text, ...data)
    if (text instanceof Error) text = text.message
    const now = dateNowString()
    const payload = {
      level,
      time: now,
      message: text
    }
    if (data && data.length > 0) {
      data = data.map((item) => item instanceof Error ? item.toString() : item)
      if (data.length === 1) {
        data = data[0]
      }
      payload.data = data
    }
    idb.put('logging', payload)
    .catch((err) => {
      console.error('Error writing to indexedDB -', err.message)
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
