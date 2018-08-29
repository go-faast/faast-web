import config from 'Config'
import Web3 from 'web3'

interface FaastWeb3 extends Web3 {
  providerType?: string
  providerName?: string
}

declare global {
  interface Window {
    web3?: any
    faastWeb3?: FaastWeb3
  }
}

let faastWeb3: FaastWeb3
let providerType
let providerName = 'Web3'
if (typeof window.web3 !== 'undefined' && typeof window.web3.currentProvider !== 'undefined') {
  const { currentProvider } = window.web3
  faastWeb3 = new Web3(currentProvider)
  providerType = 'user'
  const providerNameRaw = currentProvider.constructor.name
  if (currentProvider.isMetaMask || providerNameRaw === 'MetamaskInpageProvider') {
    providerName = 'MetaMask'
  } else if (providerNameRaw === 'EthereumProvider') {
    providerName = 'Mist'
  } else if (providerNameRaw === 'o') {
    providerName = 'Parity'
  }
} else {
  faastWeb3 = new Web3(new Web3.providers.HttpProvider(config.web3Provider))
  providerType = 'faast'
}
faastWeb3.providerType = providerType
faastWeb3.providerName = providerName
window.faastWeb3 = faastWeb3
export default faastWeb3
