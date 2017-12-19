import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import CreateWalletModalView from './view'
import toastr from 'Utilities/toastrWrapper'
import { downloadJson } from 'Utilities/helpers'
import log from 'Utilities/log'
import { openWallet } from 'Actions/portfolio'
import { EthereumWalletKeystore } from 'Services/Wallet'

const initialState = {
  createdWallet: null,
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

class CreateWalletModal extends Component {
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
      return this.props.wallet.getPrivateKeyString(values.password)
        .then((privateKey) => {
          this._handleCreatePasswordWithPrivKey(Object.assign({}, values, { privateKey }))
        })
    }
    if (validateCreatePassword(values)) {
      const createdWallet = this._generateNewWallet(values.password)
      if (createdWallet) {
        this.setState({ createdWallet, view: 'confirm' })
      } else {
        toastr.error('Error generating wallet')
      }
    }
  }

  _handleCreatePasswordWithPrivKey (values) {
    const name = this.props.isNewWallet ? 'wallet' : 'keystore file'
    if (validateCreatePassword(values, name)) {
      const createdWallet = this._generateFromPrivKey(values.privateKey, values.password)
      if (createdWallet) {
        this.setState({ createdWallet, view: 'confirm' })
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
    downloadJson(this.state.createdWallet.keystore, this.state.fileName, true)
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
      this.props.openWallet(this.state.createdWallet, this.props.mock.mocking)
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
    return EthereumWalletKeystore.fromPrivateKey(privateKey).encrypt(password)
  }

  _generateNewWallet (password) {
    return EthereumWalletKeystore.generate().encrypt(password)
  }

  _getFileName (password) {
    return this.state.createdWallet.getFileName(password)
  }

  _handleImportPrivKey () {
    this.setState({ view: 'import' })
  }

  render () {
    return (
      <CreateWalletModalView
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

CreateWalletModal.propTypes = {
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
  openWallet: (wallet, isMocking) => {
    dispatch(openWallet(wallet, isMocking))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateWalletModal)
