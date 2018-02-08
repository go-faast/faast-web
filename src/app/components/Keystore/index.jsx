import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import KeystoreView from './view'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { openWallet } from 'Actions/portfolio'
import { EthereumWalletKeystore } from 'Services/Wallet'

const Keystore = ({ openWallet, routerPush, mock: { mocking: isMocking } }) => {
  const handleDrop = (files) => {
    const file = files[0]
    const reader = new window.FileReader()

    reader.onload = (event) => {
      const encryptedWalletString = event.target.result
      if (!encryptedWalletString) return toastr.error('Not a valid wallet keystore file')

      openWallet(new EthereumWalletKeystore(encryptedWalletString), isMocking)
      log.info('Encrypted wallet set')
      routerPush('/balances')
    }

    reader.readAsText(file)
  }

  return (
    <KeystoreView handleDrop={handleDrop} />
  )
}

Keystore.propTypes = {
  openWallet: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
  mock: state.mock
})

const mapDispatchToProps = {
  openWallet,
  routerPush: push,
}

export default connect(mapStateToProps, mapDispatchToProps)(Keystore)
