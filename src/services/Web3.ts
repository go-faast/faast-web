import Web3 from 'web3'
import { Provider } from 'web3/providers'
import Web3ProviderEngine from 'web3-provider-engine'
import Subprovider from 'web3-provider-engine/subproviders/subprovider'
import ProviderSubprovider from 'web3-provider-engine/subproviders/provider'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'

import { InjectedUserSubprovider } from 'Src/lib'
import config from 'Config'
import log from 'Log'

declare global {
  interface Window {
    ethereum?: any
    web3?: any
    faastWeb3?: any
  }
}

let userProvider: Provider
let userSubprovider: Subprovider

const engine = new Web3ProviderEngine()
// Injected user web3 for account methods
engine.addProvider(new InjectedUserSubprovider(() => userSubprovider))
// Public node for lookups
engine.addProvider(new RpcSubprovider({ rpcUrl: config.web3Provider }))
engine.on('error', log.error)
engine.start()

class FaastWeb3 extends Web3 {

  enableUserProvider(): Promise<Provider> {
    if (userProvider) {
      return Promise.resolve(userProvider)
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
      const userWeb3 = new Web3(provider)
      if (!userWeb3.eth.net.getId) {
        throw new Error('Unable to determine network ID')
      }
      return userWeb3.eth.net.getId()
        .then((id) => {
          if (id !== 1) {
            throw new Error('Unsupported network')
          }
          userProvider = provider
          userSubprovider = new ProviderSubprovider(provider)
          return provider
        })
    })
  }
}

const faastWeb3 = new FaastWeb3(engine)
window.faastWeb3 = faastWeb3
export default faastWeb3
