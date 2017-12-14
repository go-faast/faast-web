import config from 'Config'
const { Web3 } = window // Global via script tag

let faastWeb3
if (typeof window.web3 !== 'undefined') {
  faastWeb3 = new Web3(window.web3.currentProvider)
  faastWeb3.providerType = 'user'
} else {
  faastWeb3 = new Web3(new Web3.providers.HttpProvider(config.web3Provider))
  faastWeb3.providerType = 'faast'
}

export default faastWeb3