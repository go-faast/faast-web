import web3 from 'Services/Web3'

export const closeTrezorWindow = () => {
  if (window.faast.hw && window.faast.hw.trezor && window.faast.hw.trezor.close) window.faast.hw.trezor.close()
}

export const getTransactionReceipt = (txHash) => {
  return web3.eth.getTransactionReceipt(txHash)
}

export const isValidAddress = (address) => {
  return web3.utils.isAddress(address)
}
