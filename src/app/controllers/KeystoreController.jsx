import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Keystore from 'Views/Keystore'
import { parseEncryptedWalletString } from 'Utilities/wallet'
import { sessionStorageSet } from 'Utilities/helpers'
import log from 'Utilities/log'
import toastr from 'Utilities/toastrWrapper'
import { setEncryptedWallet } from 'Actions/redux'

const KeystoreController = (props) => {
  const handleDrop = (files) => {
    const file = files[0]
    const reader = new window.FileReader()

    reader.onload = (event) => {
      const encryptedWallet = parseEncryptedWalletString(event.target.result)
      if (!encryptedWallet) return toastr.error('Not a valid wallet keystore file')

      sessionStorageSet('encryptedWallet', event.target.result)
      props.setEncryptedWallet(encryptedWallet)
      log.info('Encrypted wallet set')
    }

    reader.readAsText(file)
  }

  return (
    <Keystore handleDrop={handleDrop} />
  )
}

KeystoreController.propTypes = {
  setEncryptedWallet: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => ({
  setEncryptedWallet: (encryptedWallet) => {
    dispatch(setEncryptedWallet(encryptedWallet))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(KeystoreController)
