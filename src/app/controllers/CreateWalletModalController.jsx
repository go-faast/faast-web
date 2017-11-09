import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CreateWalletModal from 'Views/CreateWalletModal'
import {
  generateWallet,
  generateWalletFromPrivateKey,
  encryptWallet,
  decryptWallet,
  getFileName
} from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import { downloadJson, sessionStorageSet } from 'Utilities/helpers'
import log from 'Utilities/log'
import { setEncryptedWallet } from 'Actions/redux'

const initialState = {
  encryptedWallet: null,
  fileName: null,
  view: 'create',
  downloaded: false
}

const validateCreatePassword = (values) => {
  if (!values || !values.password || values.password.length < 8) {
    toastr.error('It is important to secure your wallet with a strong password. Please use a minimum of 8 characters', { timeOut: 8000 })
    return false
  }
  return true
}

class CreateWalletModalController extends Component {
  constructor () {
    super()
    this.state = initialState
    this._handleCreatePassword = this._handleCreatePassword.bind(this)
    this._handleCreatePasswordWithPrivKey = this._handleCreatePasswordWithPrivKey.bind(this)
    this._handleConfirmPassword = this._handleConfirmPassword.bind(this)
    this._handleCloseModal = this._handleCloseModal.bind(this)
    this._handleDownload = this._handleDownload.bind(this)
    this._handleContinue = this._handleContinue.bind(this)
    this._generateNewWallet = this._generateNewWallet.bind(this)
    this._generateFromPrivKey = this._generateFromPrivKey.bind(this)
    this._getFileName = this._getFileName.bind(this)
    this._handleImportPrivKey = this._handleImportPrivKey.bind(this)
  }

  _handleCreatePassword (values) {
    if (validateCreatePassword(values)) {
      const encryptedWallet = this._generateNewWallet(values.password)
      if (encryptedWallet) {
        this.setState({ encryptedWallet, view: 'confirm' })
      } else {
        toastr.error('Error generating wallet')
      }
    }
  }

  _handleCreatePasswordWithPrivKey (values) {
    if (validateCreatePassword(values)) {
      const encryptedWallet = this._generateFromPrivKey(values.privateKey, values.password)
      if (encryptedWallet) {
        this.setState({ encryptedWallet, view: 'confirm' })
      } else {
        toastr.error('Please enter a valid private key')
      }
    }
  }

  _handleConfirmPassword (values) {
    this._getFileName(values.password)
    .then((fileName) => {
      this.setState({ view: 'download', fileName })
    })
    .catch(log.error)
  }

  _handleDownload () {
    downloadJson(this.state.encryptedWallet, this.state.fileName, true)
    .then(() => {
      this.setState({ download: true })
    })
    .catch(() => {
      toastr.error('Sorry, there was a problem with your request')
    })
  }

  _handleContinue () {
    if (!this.state.download) {
      return toastr.error('Please download the wallet keystore file before continuing')
    }
    sessionStorageSet('encryptedWallet', JSON.stringify(this.state.encryptedWallet))

    this.props.setEncryptedWallet(this.state.encryptedWallet)
  }

  _handleCloseModal () {
    this.setState(initialState)
    this.props.toggleModal()
  }

  _generateFromPrivKey (privateKey, password) {
    if (!privateKey) return null

    return generateWalletFromPrivateKey(privateKey, password)
  }

  _generateNewWallet (password) {
    return encryptWallet(generateWallet(), password)
  }

  _getFileName (password) {
    return new Promise((resolve, reject) => {
      decryptWallet(this.state.encryptedWallet, password)
      .then((wallet) => {
        return resolve(getFileName(wallet))
      })
      .catch((e) => {
        toastr.error('Incorrect password')
        reject(e)
      })
    })
  }

  _handleImportPrivKey () {
    this.setState({ view: 'import' })
  }

  render () {
    return (
      <CreateWalletModal
        view={this.state.view}
        handleCreatePassword={this._handleCreatePassword}
        handleCreatePasswordWithPrivKey={this._handleCreatePasswordWithPrivKey}
        handleConfirmPassword={this._handleConfirmPassword}
        handleCloseModal={this._handleCloseModal}
        handleDownload={this._handleDownload}
        handleContinue={this._handleContinue}
        handleImportPrivKey={this._handleImportPrivKey}
        showModal={this.props.showModal}
      />
    )
  }
}

CreateWalletModalController.propTypes = {
  setEncryptedWallet: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = (dispatch) => ({
  setEncryptedWallet: (encryptedWallet) => {
    dispatch(setEncryptedWallet(encryptedWallet))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateWalletModalController)
