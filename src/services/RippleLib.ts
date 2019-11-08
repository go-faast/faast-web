import { RippleAPI } from 'ripple-lib'
import log from 'Log'

export { RippleAPI }

const rippleLib = async () => await connectRippleAPI()

export default rippleLib

let api: RippleAPI

export let connected = false

export async function connectRippleAPI() {
  if (typeof window !== 'undefined') {
    try {
      if (!api) {
        api = new RippleAPI({
          server: 'wss://s1.ripple.com',
        })
      }
      if (!api.isConnected()) {
        await api.connect()
      }
      api.on('error', (errorCode, errorMessage) => {
        connected = false
        log.info(errorCode + ': ' + errorMessage)
      })
      api.on('connected', () => {
        connected = true
        log.info('connected')
      })
      api.on('disconnected', (code) => {
        connected = false
        log.info('disconnected, code:', code)
      })
      return api
    } catch (err) {
      throw new Error('unable to connect to ripple lib')
    }
  }
}

export function disconnectRippleAPI() {
  if (api && typeof window !== 'undefined') {
    api.disconnect()
  }
}
