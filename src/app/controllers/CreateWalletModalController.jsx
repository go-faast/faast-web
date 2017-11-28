import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CreateWalletModal from 'Views/CreateWalletModal'
import {
  generateWallet,
  generateWalletFromPrivateKey,
  encryptWallet,
  decryptWallet,
  getFileName,
  getPrivateKeyString
} from 'Utilities/wallet'
import toastr from 'Utilities/toastrWrapper'
import { downloadJson } from 'Utilities/helpers'
import { sessionStorageSet } from 'Utilities/storage'
import log from 'Utilities/log'
import { openWallet } from 'Actions/portfolio'

const initialState = {
  encryptedWallet: null,
  fileName: null,
  view: 'create',
  downloaded: false
}

const validateCreatePassword = (values, name = 'wallet') => {
  if (!values || !values.password || values.password.length < 8) {
    toastr.error(`It is important to secure your ${name} with a strong password. Please use a minimum of 8 characters`, { timeOut: 8000 })
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
    if (!this.props.isNewWallet && this.props.wallet.type === 'blockstack') {
      return getPrivateKeyString(this.props.wallet.data)
      .then((privateKey) => {
        this._handleCreatePasswordWithPrivKey(Object.assign({}, values, { privateKey }))
      })
    }
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
    const name = this.props.isNewWallet ? 'wallet' : 'keystore file'
    if (validateCreatePassword(values, name)) {
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
    if (this.props.isNewWallet) {
      sessionStorageSet('encryptedWallet', JSON.stringify(this.state.encryptedWallet))

      this.props.openWallet('keystore', this.state.encryptedWallet, this.props.mock.mocking)
    } else {
      this.props.handleContinue ? this.props.handleContinue() : this._handleCloseModal()
    }
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
        isNewWallet={this.props.isNewWallet}
      />
    )
  }
}

CreateWalletModalController.propTypes = {
  mock: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  openWallet: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool
}

const mapStateToProps = (state) => ({
  mock: state.mock,
  wallet: state.wallet
})

const mapDispatchToProps = (dispatch) => ({
  openWallet: (type, wallet, isMocking) => {
    dispatch(openWallet(type, wallet, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateWalletModalController)
