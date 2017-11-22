import React from 'react'
import { connect } from 'react-redux'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import MetaMask from 'Views/MetaMask'
import { openWallet } from 'Actions/portfolio'

const MetaMaskController = (props) => {
  const handleClick = () => {
    if (!window.web3) {
      return toastr.error('Please enable the MetaMask extension')
    }

    if (!window.web3.version || !window.web3.version.getNetwork) {
      return toastr.error('Unable to determine network ID')
    }
    window.web3.version.getNetwork((err, id) => {
      if (err) {
        log.error(err)
        return toastr.error('Error getting network ID')
      }
      if (id !== '1') {
        return toastr.error('Please adjust your MetaMask to use the "Main Ethereum Network"', { timeOut: 10000 })
      }

      log.info('switching to metamask provider')
      window.faast.web3 = new window.Web3(window.web3.currentProvider)
      window.faast.web3.eth.getAccounts()
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

  return <MetaMask handleClick={handleClick} />
}

const mapStateToProps = (state) => ({
  mock: state.mock
})

const mapDispatchToProps = (dispatch) => ({
  openWallet: (type, wallet, isMocking) => {
    dispatch(openWallet(type, wallet, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(MetaMaskController)
