import React from 'react'
import { connect } from 'react-redux'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import MetaMaskView from './view'
import { openWallet } from 'Actions/portfolio'
import web3 from 'Services/Web3'

const MetaMask = (props) => {
  const handleClick = () => {
    if (web3.providerType !== 'user') {
      return toastr.error('Please enable the MetaMask extension')
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
        return toastr.error('Please adjust your MetaMask to use the "Main Ethereum Network"', { timeOut: 10000 })
      }

      web3.eth.getAccounts()
      .then((accounts) => {
        const address = accounts[0]
        if (!address) return toastr.error('Unable to retrieve MetaMask account. Please ensure your account is unlocked.', { timeOut: 10000 })

        props.openWallet('metamask', { address }, props.mock.mocking)
      })
      .catch((err) => {
        log.error(err)
        toastr.error('Error retrieving MetaMask account')
      })
    })
  }

  return <MetaMaskView handleClick={handleClick} />
}

const mapStateToProps = (state) => ({
  mock: state.mock
})

const mapDispatchToProps = (dispatch) => ({
  openWallet: (type, wallet, isMocking) => {
    dispatch(openWallet(type, wallet, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(MetaMask)
