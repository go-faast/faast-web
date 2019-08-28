import Web3 from 'web3'

import config from 'Config'
import log from 'Log'

declare global {
  interface Window {
    ethereum?: any
    web3?: any
    faastWeb3?: any
    userWeb3?: any
  }
}

const faastWeb3 = new Web3(new Web3.providers.HttpProvider(config.web3Provider))
if (typeof window !== 'undefined') {
  window.faastWeb3 = faastWeb3
}
export default faastWeb3

export { Web3 }

export function getWeb3(): Web3 {
  if (window.userWeb3) {
    return window.userWeb3
  }
  return faastWeb3
}

export function getFaastWeb3(): Web3 {
  return faastWeb3
}

export function getUserWeb3(): Promise<Web3> {
  if (window.userWeb3) {
    return Promise.resolve(window.userWeb3)
  }
  return Promise.resolve().then(() => {
    if (window.ethereum) {
      // Modern dapp browsers...
      log.debug('using window.ethereum provider')
      return window.ethereum.enable()
        .then(() => window.ethereum)
    } else if (window.web3) {
      // Legacy dapp browsers...
      log.debug('using legacy window.web3 provider')
      return window.web3.currentProvider
    } else {
      throw new Error('No web3 provider detected')
    }
  }).then((provider) => {
    const web3 = new Web3(provider)
    if (!web3.eth.net.getId) {
      throw new Error('Unable to determine network ID')
    }
    return web3.eth.net.getId()
      .then((id) => {
        if (id !== 1) {
          throw new Error('Unsupported network')
        }
        window.userWeb3 = web3
        return web3
      })
  })
}
