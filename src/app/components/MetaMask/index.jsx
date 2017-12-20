import React from 'react'
import { connect } from 'react-redux'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import MetaMaskView from './view'
import { openWallet } from 'Actions/portfolio'
import web3 from 'Services/Web3'
import { EthereumWalletWeb3 } from 'Services/Wallet'

const MetaMask = (props) => {
  const handleClick = () => {
    if (web3.providerType !== 'user') {
      return toastr.error('Please enable the MetaMask extension or use a Web3 compatible browser such as Mist or Parity.')
    }

    if (!web3.version || !web3.eth.net.getId) {
      return toastr.error('Unable to determine network ID')
    }
    web3.eth.net.getId((err, id) => {
      if (err) {
        log.error(err)
        return toastr.error('Error getting network ID')
      }
      if (id !== 1) {
        return toastr.error(`Please adjust ${web3.providerName} to use the "Main Ethereum Network"`, { timeOut: 10000 })
      }

      EthereumWalletWeb3.fromDefaultAccount()
        .then((wallet) => props.openWallet(wallet, props.mock.mocking))
        .catch((err) => toastr.error(err.message || 'Unknown error occured creating Web3 wallet', { timeOut: 10000 }))
    })
  }

  return <MetaMaskView handleClick={handleClick} />
}

const mapStateToProps = (state) => ({
  mock: state.mock
})

const mapDispatchToProps = (dispatch) => ({
  openWallet: (wallet, isMocking) => {
    dispatch(openWallet(wallet, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(MetaMask)
