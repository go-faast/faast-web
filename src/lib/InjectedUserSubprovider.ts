import Subprovider from 'web3-provider-engine/subproviders/subprovider'

const USER_METHODS = [
  'eth_coinbase',
  'eth_accounts',
  'eth_signTransaction',
  'eth_sendTransaction',
  'eth_sign',
  'personal_sign',
  'personal_ecRecover',
]

export default class InjectedUserSubprovider extends Subprovider {
  constructor(public getUserSubprovider: () => any) {
    super()
  }

  handleRequest(payload: { method: string }, next: () => any, end: () => any) {
    if (!USER_METHODS.includes(payload.method)) {
      return next()
    }
    const userSubprovider = this.getUserSubprovider()
    if (!userSubprovider) {
      return next()
    }
    return userSubprovider.handleRequest(payload, next, end)
  }
}
