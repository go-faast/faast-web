import _ from 'lodash'

export default class ET {
  constructor () {
    this.initialized = false
    this.users = new Map()
  }

  log (msg) {
    console.log('[ET]', msg)
  }

  async init (conf) {
    const p = []
    this.log('the Extra-Testrestrial')
    this.log('Initializing...')
    this.validateConfArrays('users', conf.users, ['key'])
    conf.users.forEach(user => {
      this.validateProps(['key', 'wallets'], user)
      p.push(this.assignUser(user))
    })
    await Promise.all(p)
    this.initialized = true
    this.initialized_time = Date.now()
  }

  validateConfArrays (type, arr, uniqueList) {
    if (!Array.isArray(arr)) throw new Error(`[ET] ${type} setting must be an array`)
    uniqueList.forEach((k) => {
      const filtered = _.uniqWith(arr, (a, b) => a[k] === b[k])
      if (filtered.length !== arr.length) {
        throw new Error(`[ET] All ${type} "${k}" props must be unique`)
      }
    })
  }

  validateProps (propList, props) {
    if (typeof props !== 'object') throw new Error('[ET] Invalid props provided')
    const missing = propList.map(a => {
      if (!props[a]) return a
    }).filter(a => a)
    if (missing.length) throw new Error(`[ET] Missing properties: [${missing}]`)
  }

  async assignUser (props) {
    if (!props.key) throw new Error('[ET] Missing user key')
    props.wallets.forEach(wallet => {
      this.validateProps(['key', 'type'], wallet)
      switch (wallet.type) {
        case 'keystore':
          this.validateProps(['file', 'password'], wallet)
          break
        default:
          throw new Error(`[ET] Unsupported wallet type: ${wallet.type}`)
      }
    })

    const userData = {
      wallets: props.wallets,
      bucket: new Map()
    }
    this.users.set(props.key, userData)
  }
}
