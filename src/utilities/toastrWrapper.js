import { toastr } from 'react-redux-toastr'
import log from './log'

const wrapper = (method, message, options) => {
  log.info(`Toastr ${method} message - ${message}`)
  toastr[method](message, options)
}

export default {
  success: (message, options) => wrapper('success', message, options),
  info: (message, options) => wrapper('info', message, options),
  warning: (message, options) => wrapper('warning', message, options),
  error: (message, options) => wrapper('error', message, options),
  confirm: (message, options) => wrapper('confirm', message, options)
}
