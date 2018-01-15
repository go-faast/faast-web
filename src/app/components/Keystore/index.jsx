import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import KeystoreView from './view'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { openWallet } from 'Actions/portfolio'
import { EthereumWalletKeystore } from 'Services/Wallet'

const Keystore = (props) => {
  const handleDrop = (files) => {
    const file = files[0]
    const reader = new window.FileReader()

    reader.onload = (event) => {
      const encryptedWalletString = event.target.result
      if (!encryptedWalletString) return toastr.error('Not a valid wallet keystore file')

      props.openWallet(new EthereumWalletKeystore(encryptedWalletString), props.mock.mocking)
      log.info('Encrypted wallet set')
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

const mapDispatchToProps = (dispatch) => ({
  openWallet: (wallet, isMocking) => {
    dispatch(openWallet(wallet, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Keystore)
